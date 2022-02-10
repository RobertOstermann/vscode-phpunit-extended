import { SpawnOptions } from "child_process";
import * as vscode from "vscode";
import Commands from "../CommandLine/commands";
import { ShowOutput, WorkingDirectory } from "../Helpers/enums";
import TestExplorerConfiguration from "./Helpers/configuration";

import Constants from "./Helpers/constants";
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
    const phpunitPath = TestExplorerConfiguration.execPath();

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

  public async execPhpUnit(phpunitPath: string) {
    let workingDirectory = TestExplorerConfiguration.workingDirectory();
    switch (workingDirectory.toLowerCase()) {
      case WorkingDirectory.Find:
        workingDirectory = TestRunnerHelper.findWorkingDirectory(this.fsPath);
        if (workingDirectory == null) {
          const errorMessage = "Couldn't find a working directory.";
          vscode.window.showErrorMessage(errorMessage);
          return { success: false, output: errorMessage };
        }
        break;
      case WorkingDirectory.Parent:
        workingDirectory = undefined;
        break;
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
      cwd: workingDirectory ? workingDirectory.replace(/([\\\/][^\\\/]*\.[^\\\/]+)$/, "") : undefined,
      env: TestExplorerConfiguration.envVars(),
    };

    const output = await TestRunnerHelper.promiseWithTimeout(
      new TestProcess().run(command, this.args, spawnOptions),
      TestExplorerConfiguration.timeout() * 1000,
      Constants.timeoutMessage
    );

    const { success, message } = TestRunnerHelper.parsePhpUnitOutput(output);

    const showOutput = TestExplorerConfiguration.showOutput();
    switch (showOutput) {
      case ShowOutput.Always:
        Commands.outputChannel.append(`${output}\n-------------------------------------------------------\n`);
        Commands.outputChannel.show();
        break;
      case ShowOutput.Error:
        if (success) break;
        Commands.outputChannel.append(`${output}\n-------------------------------------------------------\n`);
        Commands.outputChannel.show();
      case ShowOutput.Never:
        break;
    }

    return { success: success, message: message, output: output };
  }
}