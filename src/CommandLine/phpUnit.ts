/* eslint-disable no-useless-escape */
import * as vscode from 'vscode';
import cp = require('child_process');
import fs = require('fs');
import CommandLineConfiguration from './Helpers/configuration';
import { SpawnOptions } from 'child_process';
import { ShowOutput, WorkingDirectory } from '../Helpers/enums';
import PathHelper from '../Helpers/pathHelper';

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
    const phpUnitComposerBinFile = PathHelper.findNearestFileFullPath('vendor/bin/phpunit');

    if (phpUnitComposerBinFile != null) {
      this.execPhpUnit(phpUnitComposerBinFile);
    } else {
      vscode.window.showErrorMessage('Couldn\'t find a vendor/bin/phpunit file.');
    }
  }

  public execPhpUnit(phpunitPath: string) {
    const showOutput = CommandLineConfiguration.showOutput();
    this.outputChannel.clear();

    const workingDirectory = this.getWorkingDirectory();
    if (workingDirectory === null) {
      const errorMessage = "Couldn't find a working directory.";
      vscode.window.showErrorMessage(errorMessage);
      return { success: false, output: errorMessage };
    }

    const command = this.setArguments(phpunitPath, workingDirectory);
    const spawnOptions: SpawnOptions = {
      cwd: workingDirectory ? workingDirectory.replace(/([\\\/][^\\\/]*\.[^\\\/]+)$/, "") : undefined,
      env: CommandLineConfiguration.envVars(),
    };

    const phpunitProcess = cp.spawn(
      command,
      this.args,
      spawnOptions
    );

    PhpUnit.currentTest = phpunitProcess;

    this.outputChannel.appendLine(`${phpunitPath} ${this.args.join(' ')}\n`);

    phpunitProcess.stderr.on("data", (buffer: Buffer) => {
      this.outputChannel.append(buffer.toString());
    });
    phpunitProcess.stdout.on("data", (buffer: Buffer) => {
      this.outputChannel.append(buffer.toString());
    });
    phpunitProcess.on("close", (code) => {
      this.outputChannel.appendLine('\n-------------------------------------------------------\n');
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
        this.outputChannel.appendLine('\n-------------------------------------------------------\n');
      }
    });

    if (showOutput == ShowOutput.Always) {
      this.outputChannel.show();
    }
  }

  static cancelCurrentTest() {
    if (PhpUnit.currentTest) {
      PhpUnit.currentTest.kill();
      PhpUnit.currentTest = null;
    } else {
      vscode.window.showInformationMessage("There are no tests running.");
    }
  }

  private getWorkingDirectory(): string {
    let workingDirectory = CommandLineConfiguration.workingDirectory();
    switch (workingDirectory.toLowerCase()) {
      case WorkingDirectory.Find:
        workingDirectory = PathHelper.findWorkingDirectory();
        break;
      case WorkingDirectory.Parent:
        workingDirectory = undefined;
        break;
    }
    return workingDirectory;
  }

  private setArguments(phpunitPath: string, workingDirectory: string): string {
    if (this.putFsPathIntoArgs) {
      let fsPath = PathHelper.normalizePath(vscode.window.activeTextEditor.document.uri.fsPath);

      this.args.push(fsPath);
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

    return command;
  }
}