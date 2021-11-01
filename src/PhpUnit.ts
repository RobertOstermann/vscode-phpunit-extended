import * as vscode from 'vscode';
import cp = require('child_process');
import fs = require('fs');

export class PhpUnit {
    private args: any;
    private putFsPathIntoArgs: boolean;
    private outputChannel: any;
    public static lastCommand: any;
    public static currentTest: cp.ChildProcess;

    constructor(outputChannel: any, args: string[], putFsPathIntoArgs: boolean = true) {
        this.outputChannel = outputChannel;
        this.args = args;
        this.putFsPathIntoArgs = putFsPathIntoArgs;
    }

    public run() {
        let config = vscode.workspace.getConfiguration("phpunit");
        let phpunitPath = config.get<string>("execPath", "phpunit");

        if (phpunitPath == "") {
            this.execThroughComposer(phpunitPath);
        } else {
            this.execPhpUnit(phpunitPath);
        }
    }

    private execThroughComposer(phpunitPath: string, currentPath = '') {
        let phpUnitComposerBinFile = this.findNearestFileFullPath('vendor/bin/phpunit');

        if (phpUnitComposerBinFile != null) {
            this.execPhpUnit(phpUnitComposerBinFile);
        } else {
            vscode.window.showErrorMessage('Couldn\'t find a vendor/bin/phpunit file.');
        }
    }

    public execPhpUnit(phpunitPath: string, workingDirectory = null) {
        this.outputChannel.clear();

        workingDirectory = workingDirectory == null ? this.findWorkingDirectory() : workingDirectory;
        let showOutput = vscode.workspace.getConfiguration('phpunit').showOutput;
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

        let phpunitProcess = cp.spawn(
            command,
            this.args,
            { cwd: workingDirectory.replace(/([\\\/][^\\\/]*\.[^\\\/]+)$/, ''), env: vscode.workspace.getConfiguration('phpunit').envVars }
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
            let status = code == 0 ? 'ok' : 'error';
            if (showOutput == 'ok' && code == 0) {
                this.outputChannel.show();
            } else if (showOutput == 'error' && code == 1) {
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

        if (showOutput == 'always') {
            this.outputChannel.show();
        }
    }

    private findNearestFileFullPath(fileRelativeName: string, currentPath = '') {
        let rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

        if (currentPath == '') {
            let filePath = vscode.window.activeTextEditor.document.uri.fsPath;
            currentPath = filePath.replace(/([\\\/][^\\\/]*\.[^\\\/]+)$/, '');
        } else {
            currentPath = currentPath.replace(/[\\\/][^\\\/]*$/, '');
        }

        let fileFullPath = `${currentPath}/${fileRelativeName}`;

        if (fs.existsSync(fileFullPath)) {
            return fileFullPath;
        } else if (currentPath != rootPath) {
            return this.findNearestFileFullPath(fileRelativeName, currentPath);
        } else {
            return null;
        }
    }

    private findWorkingDirectory() {
        let workingDirectory = this.findNearestFileFullPath('phpunit.xml')
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
