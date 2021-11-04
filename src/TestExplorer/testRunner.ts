import { SpawnOptions } from "child_process";
import * as vscode from "vscode";

import { Constants } from "./Helpers/constants";
import TestProcess from "./testProcess";
import TestRunnerHelper from "./testRunnerHelper";

export default class TestRunner {
  private args: string[];
  private fsPath: string;
  private putFsPathIntoArgs: boolean;

  constructor(args: string[], fsPath = "") {
    this.args = args;
    this.fsPath = fsPath;
  }

  async run() {
    const config = vscode.workspace.getConfiguration("phpunit");
    const phpunitPath = config.get<string>("execPath", "phpunit");

    if (phpunitPath == "") {
      return await this.execThroughComposer();
    } else {
      return await this.execPhpUnit(phpunitPath);
    }
  }

  private async execThroughComposer() {
    const phpUnitComposerBinFile =
      TestRunnerHelper.findNearestFileFullPath("vendor/bin/phpunit");

    if (phpUnitComposerBinFile != null) {
      return await this.execPhpUnit(phpUnitComposerBinFile);
    } else {
      const errorMessage = "Couldn't find a vendor/bin/phpunit file.";
      vscode.window.showErrorMessage(errorMessage);
      return { success: false, output: errorMessage };
    }
  }

  public async execPhpUnit(phpunitPath: string, workingDirectory = null) {
    workingDirectory =
      workingDirectory == null
        ? TestRunnerHelper.findWorkingDirectory()
        : workingDirectory;

    if (workingDirectory == null) {
      const errorMessage = "Couldn't find a working directory.";
      vscode.window.showErrorMessage(errorMessage);
      return { success: false, output: errorMessage };
    }

    if (this.fsPath) {
      this.args.push(this.fsPath);
    }

    let command = "";

    if (/^win/.test(process.platform)) {
      command = "cmd";
      this.args.unshift(phpunitPath);
      this.args.unshift("/c");
    } else {
      command = phpunitPath;
    }

    const spawnOptions: SpawnOptions = {
      cwd: workingDirectory.replace(/([\\\/][^\\\/]*\.[^\\\/]+)$/, ""),
      env: vscode.workspace.getConfiguration("phpunit").envVars,
    };

    const timeout: number = vscode.workspace
      .getConfiguration("phpunit")
      .get("timeout");

    const output = await TestRunnerHelper.promiseWithTimeout(
      new TestProcess().run(command, this.args, spawnOptions),
      timeout * 1000,
      Constants.timeoutMessage
    );

    const { success, message } = TestRunnerHelper.parsePhpUnitOutput(output);

    return { success: success, message: message, output: output };
  }
}
