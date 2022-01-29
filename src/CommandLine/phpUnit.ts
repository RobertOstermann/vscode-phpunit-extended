/* eslint-disable no-useless-escape */
import * as vscode from 'vscode';
import cp = require('child_process');
import fs = require('fs');
import CommandLineConfiguration from './Helpers/configuration';

export class PhpUnit {
    private args: string[];
    private putFsPathIntoArgs: boolean;
    private outputChannel: vscode.OutputChannel;
    public static lastCommand: { args: string[]; putFsPathIntoArgs: boolean; phpunitPath: string; workingDirectory: string; };
    public static currentTest: cp.ChildProcess;

    constructor(outputChannel: vscode.OutputChannel, args: string[], putFsPathIntoArgs = true) {
        this.outputChannel = outputChannel;
        this.args = args;
        this.putFsPathIntoArgs = putFsPathIntoArgs;
    }

    public run() {
        const phpunitPath = CommandLineConfiguration.execPath();

        if (phpunitPath == "") {
            this.execThroughComposer();
        } else {
            this.execPhpUnit(phpunitPath);
        }
    }

    private execThroughComposer() {
        const phpUnitComposerBinFile = this.findNearestFileFullPath('vendor/bin/phpunit');

        if (phpUnitComposerBinFile != null) {
            this.execPhpUnit(phpUnitComposerBinFile);
        } else {
            vscode.window.showErrorMessage('Couldn\'t find a vendor/bin/phpunit file.');
        }
    }

    public execPhpUnit(phpunitPath: string, workingDirectory = null) {
        const showOutput = CommandLineConfiguration.showOutput();
        this.outputChannel.clear();

        workingDirectory = workingDirectory == null ? this.findWorkingDirectory() : workingDirectory;
        if (showOutput != 'always') {
            this.outputChannel.hide();
        }

        if (workingDirectory == null) {
            return;
        }

        if (this.putFsPathIntoArgs) {
            this.args.push(vscode.window.activeTextEditor.document.uri.fsPath);
        }

        PhpUnit.lastCommand = {
            phpunitPath,
            workingDirectory,
            args: this.args.slice(),
            putFsPathIntoArgs: false
        };

        let command = '';

        if (/^win/.test(process.platform)) {
            command = 'cmd';
            this.args.unshift(phpunitPath);
            this.args.unshift('/c');
        } else {
            command = phpunitPath;
        }

        const phpunitProcess = cp.spawn(
            command,
            this.args,
            { cwd: workingDirectory.replace(/([\\\/][^\\\/]*\.[^\\\/]+)$/, ''), env: CommandLineConfiguration.envVars() }
        );

        PhpUnit.currentTest = phpunitProcess;

        this.outputChannel.appendLine(phpunitPath + ' ' + this.args.join(' '));

        phpunitProcess.stderr.on("data", (buffer: Buffer) => {
            this.outputChannel.append(buffer.toString());
        });
        phpunitProcess.stdout.on("data", (buffer: Buffer) => {
            this.outputChannel.append(buffer.toString());
        });
        phpunitProcess.on("close", (code) => {
            const status = code == 0 ? ShowOutput.Ok : ShowOutput.Error;
            if ((showOutput == ShowOutput.Ok && code == 0) || (showOutput == ShowOutput.Error && code == 1)) {
                this.outputChannel.show();
            }

            vscode.workspace.getConfiguration('phpunit').scriptsAfterTests[status]
                .forEach((script: any) => {
                    if (typeof script === 'string') {
                        cp.spawn(script);
                    } else {
                        cp.spawn(script.command, script.args);
                    }
                });
        });

        phpunitProcess.on("exit", (code, signal) => {
            if (signal != null) {
                this.outputChannel.append('Cancelled');
            }
        });

        if (showOutput == ShowOutput.Always) {
            this.outputChannel.show();
        }
    }

    private findNearestFileFullPath(fileRelativeName: string, currentPath = '') {
        const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

        if (currentPath == '') {
            const filePath = vscode.window.activeTextEditor.document.uri.fsPath;
            currentPath = filePath.replace(/([\\\/][^\\\/]*\.[^\\\/]+)$/, '');
        } else {
            currentPath = currentPath.replace(/[\\\/][^\\\/]*$/, '');
        }

        const fileFullPath = `${currentPath}/${fileRelativeName}`;

        if (fs.existsSync(fileFullPath)) {
            return fileFullPath;
        } else if (currentPath != rootPath) {
            return this.findNearestFileFullPath(fileRelativeName, currentPath);
        } else {
            return null;
        }
    }

    private findWorkingDirectory() {
        const workingDirectory = this.findNearestFileFullPath('phpunit.xml')
            || this.findNearestFileFullPath('phpunit.xml.dist');

        if (workingDirectory == null) {
            vscode.window.showErrorMessage('Couldn\'t find a working directory.');
        }

        return workingDirectory;
    }

    static cancelCurrentTest() {
        if (PhpUnit.currentTest) {
            PhpUnit.currentTest.kill();
            PhpUnit.currentTest = null;
        } else {
            vscode.window.showInformationMessage("There are no tests running.");
        }
    }
}

enum ShowOutput {
    Always = 'always',
    Error = 'error',
    Ok = 'ok'
}
