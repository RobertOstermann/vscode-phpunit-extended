import { SpawnOptions } from "child_process";
import * as vscode from "vscode";

import SharedConfiguration from "../Helpers/configuration";
import { ShowOutput, WorkingDirectory } from "../Helpers/enums";
import PathHelper from "../Helpers/pathHelper";
import TestExplorerConfiguration from "./Helpers/configuration";
import Constants from "./Helpers/constants";
import OutputHelper from "./Helpers/outputHelper";
import TestResult from "./Helpers/testResult";
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
   * @returns The output of {@link executePhpUnit}.
   */
  async run() {
    const phpunitPath = SharedConfiguration.execPath();

    if (phpunitPath == "") {
      return this.executeThroughComposer();
    } else {
      return this.executePhpUnit(phpunitPath);
    }
  }

  /**
   * Finds the composer installation of PHPUnit and executes the test.
   * 
   * @returns The output of {@link executePhpUnit}.
   */
  private async executeThroughComposer(): Promise<TestResult> {
    const phpUnitComposerBinFile =
      PathHelper.findNearestFileFullPath("vendor/bin/phpunit", this.fsPath);

    if (phpUnitComposerBinFile != null) {
      return this.executePhpUnit(phpUnitComposerBinFile);
    } else {
      const errorMessage = "Couldn't find a vendor/bin/phpunit file.";
      vscode.window.showErrorMessage(errorMessage);
      const result: TestResult = {};
      result.output = errorMessage;
      result.success = false;
      return result;
    }
  }

  /**
   * Execute PHPUnit using the given `phpunitPath`, as well as
   * the `args` and `fsPath` set up in the constructor.
   * 
   * @param phpunitPath - The executable path to PHP Unit.
   * @returns The success status, a shortened message, and the full output for the test run.
   */
  private async executePhpUnit(phpunitPath: string): Promise<TestResult> {
    const workingDirectory = this.getWorkingDirectory();
    if (workingDirectory === null) {
      const errorMessage = "Couldn't find a working directory.";
      vscode.window.showErrorMessage(errorMessage);
      const result: TestResult = {};
      result.output = errorMessage;
      result.success = false;
      return result;
    }

    const args = this.getArguments(phpunitPath);
    const command = this.getCommand(phpunitPath);
    const terminalArgs = this.getArguments(phpunitPath, true);
    const terminalCommand = this.getCommand(phpunitPath, true);
    const spawnOptions: SpawnOptions = {
      cwd: workingDirectory,
      env: SharedConfiguration.envVars(),
    };

    const output = await TestRunnerHelper.promiseWithTimeout(
      new TestProcess().run(command, args, spawnOptions),
      TestExplorerConfiguration.timeout(),
      Constants.timeoutMessage
    );

    const result: TestResult = TestRunnerHelper.parsePhpUnitOutput(output, this.fsPath);

    const showOutput = TestExplorerConfiguration.showOutput();
    const showOutputInTerminal = TestExplorerConfiguration.showOutputInTerminal();
    switch (showOutput) {
      case ShowOutput.Always:
        OutputHelper.outputChannel.clear();
        if (showOutputInTerminal) {
          this.executeInTerminal(terminalCommand, terminalArgs, workingDirectory);
        } else {
          OutputHelper.outputChannel.appendLine(`${command} ${args.join(" ")}\n`);
          OutputHelper.outputChannel.appendLine(`${output}\n-------------------------------------------------------\n`);
          OutputHelper.outputChannel.show();
        }
        break;
      case ShowOutput.Error:
        if (result.success) break;
        OutputHelper.outputChannel.clear();
        if (showOutputInTerminal) {
          this.executeInTerminal(terminalCommand, terminalArgs, workingDirectory);
        } else {
          OutputHelper.outputChannel.appendLine(`${command} ${args.join(" ")}\n`);
          OutputHelper.outputChannel.appendLine(`${output}\n-------------------------------------------------------\n`);
          OutputHelper.outputChannel.show();
        }
        break;
      case ShowOutput.Never:
        break;
    }

    result.output = output;
    return result;
  }

  /**
   * `phpunit.workingDirectory = 'Find'` - Find the working directory using the given `fsPath`.
   * `phpunit.workingDirectory = 'Parent'` - Set the working directory as `undefined`.
   * `phpunit.workingDirectory = '{path}'` - Get the given path for the working directory.
   * 
   * @returns The path to the working directory where the child process will spawn.
   */
  private getWorkingDirectory(): string {
    let workingDirectory = SharedConfiguration.workingDirectory();
    switch (workingDirectory.toLowerCase()) {
      case WorkingDirectory.Find:
        workingDirectory = PathHelper.findWorkingDirectory(this.fsPath);
        break;
      case WorkingDirectory.Parent:
        workingDirectory = undefined;
        break;
    }
    // eslint-disable-next-line no-useless-escape
    return workingDirectory ? workingDirectory.replace(/([\\\/][^\\\/]*\.[^\\\/]+)$/, "") : workingDirectory;
  }

  /**
   * Gets the command for the node process.
   * 
   * @param phpunitPath - The executable path for PHPUnit.
   * @param terminalCommand - Is the command being run in the terminal.
   * @returns The command to spawn a child process with.
   */
  private getCommand(phpunitPath: string, terminalCommand = false): string {
    const sshCommand = SharedConfiguration.ssh_command() ? SharedConfiguration.ssh_command() + " " : "";
    const dockerCommand = SharedConfiguration.docker_command() ? SharedConfiguration.docker_command() + " " : "";
    let command = phpunitPath;

    if (/^win/.test(process.platform) && !terminalCommand) {
      command = "cmd";
    } else {
      command = phpunitPath;
    }

    if (SharedConfiguration.ssh_enable()) {
      if (SharedConfiguration.docker_enable()) {
        command = dockerCommand + sshCommand + command;
      } else {
        command = sshCommand + command;
      }

      return command;
    }

    if (SharedConfiguration.docker_enable()) {
      const dockerCommand = SharedConfiguration.docker_command();
      command = dockerCommand + command;
    }

    return command;
  }

  /**
   * Gets the arguments for the node process.
   * 
   * @param phpunitPath - The executable path for PHPUnit.
   * @param terminalCommand - Is the command being run in the terminal.
   * @returns The arguments to spawn the child process with.
   */
  private getArguments(phpunitPath: string, terminalCommand = false): string[] {
    const args = [...this.args];

    if (this.fsPath) {
      args.push(this.fsPath);
    }

    if (/^win/.test(process.platform) && !terminalCommand) {
      args.unshift(phpunitPath);
      args.unshift("/c");
    }

    return args;
  }

  /**
   * Runs a test directly in the terminal. This may result in better output
   * than the output channel. However, it will re-run the test when using
   * the test explorer.
   * 
   * @param command -  The command to execute in the terminal.
   * @param args - The arguments to append to the command in the terminal.
   * @param workingDirectory - The directory to use for the terminal.
   */
  private executeInTerminal(command: string, args: string[], workingDirectory: string = undefined) {
    const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
    let terminal = terminals.find((t) => t.name === "PHPUnit");
    if (!terminal) {
      terminal = vscode.window.createTerminal({
        name: "PHPUnit",
        cwd: workingDirectory,
        env: SharedConfiguration.envVars()
      } as vscode.TerminalOptions);
    }
    terminal.show();
    terminal.sendText(`${command} ${args.join(" ")}`);
  }
}
