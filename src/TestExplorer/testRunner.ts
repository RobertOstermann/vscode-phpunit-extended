import { SpawnOptions } from "child_process";
import * as vscode from "vscode";
import Configuration from "./Helpers/configuration";

import { Constants } from "./Helpers/constants";
import TestProcess from "./testProcess";
import TestRunnerHelper from "./testRunnerHelper";

export default class TestRunner {
  private args: string[];
  private fsPath: string;

  constructor(args: string[], fsPath: string) {
    this.args = args;
    this.fsPath = fsPath;
  }

  async run() {
    const phpunitPath = Configuration.execPath();

    if (phpunitPath == "") {
      return this.execThroughComposer();
    } else {
      return this.execPhpUnit(phpunitPath);
    }
  }

  private async execThroughComposer() {
    const phpUnitComposerBinFile =
      TestRunnerHelper.findNearestFileFullPath("vendor/bin/phpunit", this.fsPath);

    if (phpUnitComposerBinFile != null) {
      return this.execPhpUnit(phpUnitComposerBinFile);
    } else {
      const errorMessage = "Couldn't find a vendor/bin/phpunit file.";
      vscode.window.showErrorMessage(errorMessage);
      return { success: false, output: errorMessage };
    }
  }

  public async execPhpUnit(phpunitPath: string, workingDirectory = null) {
    if (!workingDirectory) {
      workingDirectory = TestRunnerHelper.findWorkingDirectory(this.fsPath);
    }

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
      env: Configuration.envVars(),
    };

    const output = await TestRunnerHelper.promiseWithTimeout(
      new TestProcess().run(command, this.args, spawnOptions),
      Configuration.timeout() * 1000,
      Constants.timeoutMessage
    );

    const { success, message } = TestRunnerHelper.parsePhpUnitOutput(output);

    return { success: success, message: message, output: output };
  }
}
