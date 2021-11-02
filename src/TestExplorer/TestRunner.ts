import * as vscode from 'vscode';
import TestRunnerHelper from './TestRunnerHelper';
import cp = require('child_process');
import fs = require('fs');

export default class TestRunner {
  private args: string[];
  private fsPath: string;
  private putFsPathIntoArgs: boolean;

  constructor(args: string[], fsPath: string = '') {
    this.args = args;
    this.fsPath = fsPath;
  }

  public run() {
    let config = vscode.workspace.getConfiguration("phpunit");
    let phpunitPath = config.get<string>("execPath", "phpunit");

    if (phpunitPath == "") {
      return this.execThroughComposer();
    } else {
      return this.execPhpUnit(phpunitPath);
    }
  }

  private execThroughComposer() {
    let phpUnitComposerBinFile = TestRunnerHelper.findNearestFileFullPath('vendor/bin/phpunit');

    if (phpUnitComposerBinFile != null) {
      return this.execPhpUnit(phpUnitComposerBinFile);
    } else {
      let errorMessage = 'Couldn\'t find a vendor/bin/phpunit file.';
      vscode.window.showErrorMessage(errorMessage);
      return { success: false, output: errorMessage };
    }
  }

  public execPhpUnit(phpunitPath: string, workingDirectory = null) {

    workingDirectory = workingDirectory == null ? TestRunnerHelper.findWorkingDirectory() : workingDirectory;

    if (workingDirectory == null) {
      let errorMessage = 'Couldn\'t find a working directory.';
      vscode.window.showErrorMessage(errorMessage);
      return { success: false, output: errorMessage };
    }

    if (this.fsPath) {
      this.args.push(this.fsPath);
    }

    let command = '';

    if (/^win/.test(process.platform)) {
      command = 'cmd';
      this.args.unshift(phpunitPath);
      this.args.unshift('/c');
    } else {
      command = phpunitPath;
    }

    let phpunitProcess = cp.spawnSync(command, this.args, {
      cwd: workingDirectory.replace(/([\\\/][^\\\/]*\.[^\\\/]+)$/, ""),
      env: vscode.workspace.getConfiguration("phpunit").envVars,
    });

    const output = phpunitProcess.stdout.toString();
    const { success, message } = TestRunnerHelper.parsePhpUnitOutput(output);

    return { success: success, message: message, output: phpunitProcess.stdout.toString() };
  }
}
