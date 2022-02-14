import { SpawnOptions } from "child_process";
import * as vscode from "vscode";

import { ShowOutput, WorkingDirectory } from "../Helpers/enums";
import PathHelper from "../Helpers/pathHelper";
import TestExplorerConfiguration from "./Helpers/configuration";
import Constants from "./Helpers/constants";
import OutputHelper from "./Helpers/outputHelper";
import TestProcess from "./testProcess";
import TestRunnerHelper from "./testRunnerHelper";

export default class TestRunner {
  private args: string[];
  private fsPath: string;

  /**
   * Initialize the {@link TestRunner} class with arguments and a file path.
   * 
   * @param args - The arguments to pass into the {@link TestProcess}.
   * @param fsPath - The path to the test file.
   */
  constructor(args: string[], fsPath: string) {
    this.args = args;
    this.fsPath = PathHelper.remapLocalPath(fsPath);
  }

  /**
   * Executes the test using either composer or the given PHPUnit path.
   * 
   * @returns The output of {@link execPhpUnit}.
   */
  async run() {
    const phpunitPath = TestExplorerConfiguration.execPath();

    if (phpunitPath == "") {
      return this.execThroughComposer();
    } else {
      return this.execPhpUnit(phpunitPath);
    }
  }

  /**
   * Finds the composer installation of PHPUnit and executes the test.
   * 
   * @returns The output of {@link execPhpUnit}.
   */
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

  /**
   * Execute PHPUnit using the given `phpunitPath`, as well as
   * the `args` and `fsPath` set up in the constructor.
   * 
   * @param phpunitPath - The executable path to PHP Unit.
   * @returns The success status, a shortened message, and the full output for the test run.
   */
  private async execPhpUnit(phpunitPath: string) {
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
      TestExplorerConfiguration.timeout(),
      Constants.timeoutMessage
    );

    const { success, message } = TestRunnerHelper.parsePhpUnitOutput(output);

    const showOutput = TestExplorerConfiguration.showOutput();
    switch (showOutput) {
      case ShowOutput.Always:
        OutputHelper.outputChannel.appendLine(`${phpunitPath} ${this.args.join(" ")}\n`);
        OutputHelper.outputChannel.appendLine(`${output}\n-------------------------------------------------------\n`);
        OutputHelper.outputChannel.show();
        break;
      case ShowOutput.Error:
        if (success) break;
        OutputHelper.outputChannel.appendLine(`${phpunitPath} ${this.args.join(" ")}\n`);
        OutputHelper.outputChannel.appendLine(`${output}\n-------------------------------------------------------\n`);
        OutputHelper.outputChannel.show();
        break;
      case ShowOutput.Never:
        break;
    }

    return { success: success, message: message, output: output };
  }

  /**
   * `phpunit.workingDirectory = 'Find'` - Find the working directory using the given `fsPath`.
   * `phpunit.workingDirectory = 'Parent'` - Set the working directory as `undefined`.
   * `phpunit.workingDirectory = '{path}'` - Get the given path for the working directory.
   * 
   * @returns The path to the working directory where the child process will spawn.
   */
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

  /**
   * Sets the arguments and returns the command for the node process.
   * 
   * @param phpunitPath - The executable path for PHPUnit.
   * @param workingDirectory  - The working directory the child process spawns in.
   * @returns The command to spawn a child process with.
   */
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
