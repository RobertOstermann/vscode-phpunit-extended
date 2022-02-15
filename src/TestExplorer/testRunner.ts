import { SpawnOptions } from "child_process";
import * as vscode from "vscode";

import Commands from "../CommandLine/commands";
import { ShowOutput, WorkingDirectory } from "../Helpers/enums";
import PathHelper from "../Helpers/pathHelper";
import TestExplorerConfiguration from "./Helpers/configuration";
import Constants from "./Helpers/constants";
import TestProcess from "./testProcess";
import TestRunnerHelper from "./testRunnerHelper";

export default class TestRunner {
  private args: string[];
  private fsPath: string;

  constructor(args: string[], fsPath: string) {
    this.args = args;
    this.fsPath = PathHelper.normalizePath(fsPath);
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
      PathHelper.findNearestFileFullPath("vendor/bin/phpunit", this.fsPath);

    if (phpUnitComposerBinFile != null) {
      return this.execPhpUnit(phpUnitComposerBinFile);
    } else {
      const errorMessage = "Couldn't find a vendor/bin/phpunit file.";
      vscode.window.showErrorMessage(errorMessage);
      return { success: false, output: errorMessage };
    }
  }

  public async execPhpUnit(phpunitPath: string) {
    const workingDirectory = this.getWorkingDirectory();
    if (workingDirectory === null) {
      const errorMessage = "Couldn't find a working directory.";
      vscode.window.showErrorMessage(errorMessage);
      return { success: false, output: errorMessage };
    }

    const command = this.setArguments(phpunitPath);
    const spawnOptions: SpawnOptions = {
      // eslint-disable-next-line no-useless-escape
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
        Commands.outputChannel.appendLine(`${phpunitPath} ${this.args.join(" ")}\n`);
        Commands.outputChannel.appendLine(`${output}\n-------------------------------------------------------\n`);
        Commands.outputChannel.show();
        break;
      case ShowOutput.Error:
        if (success) break;
        Commands.outputChannel.appendLine(`${phpunitPath} ${this.args.join(" ")}\n`);
        Commands.outputChannel.appendLine(`${output}\n-------------------------------------------------------\n`);
        Commands.outputChannel.show();
        break;
      case ShowOutput.Never:
        break;
    }

    return { success: success, message: message, output: output };
  }

  private getWorkingDirectory(): string {
    let workingDirectory = TestExplorerConfiguration.workingDirectory();
    switch (workingDirectory.toLowerCase()) {
      case WorkingDirectory.Find:
        workingDirectory = PathHelper.findWorkingDirectory(this.fsPath);
        break;
      case WorkingDirectory.Parent:
        workingDirectory = undefined;
        break;
    }
    return workingDirectory;
  }

  private setArguments(phpunitPath: string): string {
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

    return command;
  }
}