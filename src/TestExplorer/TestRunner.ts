import * as vscode from 'vscode';
import TestRunnerHelper from './testRunnerHelper';
import TestProcess from './testProcess';
import { SpawnOptions } from 'child_process';

export default class TestRunner {
  private args: string[];
  private fsPath: string;
  private putFsPathIntoArgs: boolean;

  constructor(args: string[], fsPath: string = '') {
    this.args = args;
    this.fsPath = fsPath;
  }

  async run() {
    let config = vscode.workspace.getConfiguration("phpunit");
    let phpunitPath = config.get<string>("execPath", "phpunit");

    if (phpunitPath == "") {
      return await this.execThroughComposer();
    } else {
      return await this.execPhpUnit(phpunitPath);
    }
  }

  private async execThroughComposer() {
    let phpUnitComposerBinFile = TestRunnerHelper.findNearestFileFullPath('vendor/bin/phpunit');

    if (phpUnitComposerBinFile != null) {
      return await this.execPhpUnit(phpUnitComposerBinFile);
    } else {
      let errorMessage = 'Couldn\'t find a vendor/bin/phpunit file.';
      vscode.window.showErrorMessage(errorMessage);
      return { success: false, output: errorMessage };
    }
  }

  public async execPhpUnit(phpunitPath: string, workingDirectory = null) {
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

    let spawnOptions: SpawnOptions = {
      cwd: workingDirectory.replace(/([\\\/][^\\\/]*\.[^\\\/]+)$/, ""),
      env: vscode.workspace.getConfiguration("phpunit").envVars,
    };

    const output = await (new TestProcess()).run(command, this.args, spawnOptions);

    const { success, message } = TestRunnerHelper.parsePhpUnitOutput(output);

    return { success: success, message: message, output: output };
  }
}
