/* eslint-disable no-useless-escape */
import * as vscode from "vscode";
import cp = require("child_process");
import { SpawnOptions } from "child_process";

import SharedConfiguration from "../Helpers/configuration";
import { ShowOutput, WorkingDirectory } from "../Helpers/enums";
import PathHelper from "../Helpers/pathHelper";
import CommandLineConfiguration from "./Helpers/configuration";

export default class PhpUnit {
  private args: string[];
  private putFsPathIntoArgs: boolean;
  private outputChannel: vscode.OutputChannel;
  public static lastCommand: { args: string[]; putFsPathIntoArgs: boolean; phpunitPath: string; workingDirectory: string; };
  public static currentTest: cp.ChildProcess;

  /**
   * @param outputChannel - The output channel to display the results.
   * @param args - The arguments to pass into the command.
   * @param putFsPathIntoArgs - Determines whether or not to puth the fsPath into the arguments.
   */
  constructor(outputChannel: vscode.OutputChannel, args: string[], putFsPathIntoArgs = true) {
    this.outputChannel = outputChannel;
    this.args = args;
    this.putFsPathIntoArgs = putFsPathIntoArgs;
  }

  /**
   * Executes the test using either composer or the given PHPUnit path.
   */
  public run() {
    const phpunitPath = SharedConfiguration.execPath();

    if (phpunitPath == "") {
      this.execThroughComposer();
    } else {
      this.execPhpUnit(phpunitPath);
    }
  }

  /**
   * Finds the composer installation of PHPUnit and executes the test.
   */
  private execThroughComposer() {
    const phpUnitComposerBinFile = PathHelper.findNearestFileFullPath("vendor/bin/phpunit");

    if (phpUnitComposerBinFile != null) {
      this.execPhpUnit(phpUnitComposerBinFile);
    } else {
      vscode.window.showErrorMessage("Couldn't find a vendor/bin/phpunit file.");
    }
  }

  /**
   * Execute PHPUnit using the given `phpunitPath`, as well as
   * the `args` and `fsPath` set up in the constructor.
   * 
   * @param phpunitPath - The executable path to PHP Unit.
   */
  public execPhpUnit(phpunitPath: string) {
    const showOutput = CommandLineConfiguration.showOutput();
    const showOutputInTerminal = CommandLineConfiguration.showOutputInTerminal();
    this.outputChannel.clear();

    const workingDirectory = this.getWorkingDirectory();
    if (workingDirectory === null) {
      const errorMessage = "Couldn't find a working directory.";
      vscode.window.showErrorMessage(errorMessage);
      return { success: false, output: errorMessage };
    }

    const args = this.getArguments(phpunitPath);
    const command = this.getCommand(phpunitPath, workingDirectory);
    const terminalArgs = this.getArguments(phpunitPath, true);
    const terminalCommand = this.getCommand(phpunitPath, workingDirectory, true);
    const spawnOptions: SpawnOptions = {
      cwd: workingDirectory,
      env: SharedConfiguration.envVars(),
    };

    const phpunitProcess = cp.spawn(
      command,
      args,
      spawnOptions
    );

    PhpUnit.currentTest = phpunitProcess;

    this.outputChannel.appendLine(`${command} ${args.join(" ")}\n`);

    phpunitProcess.stderr.on("data", (buffer: Buffer) => {
      this.outputChannel.append(buffer.toString());
    });
    phpunitProcess.stdout.on("data", (buffer: Buffer) => {
      this.outputChannel.append(buffer.toString());
    });
    phpunitProcess.on("close", (code) => {
      this.outputChannel.appendLine("\n-------------------------------------------------------\n");
      const status = code == 0 ? ShowOutput.Ok : ShowOutput.Error;
      if ((showOutput == ShowOutput.Ok && code == 0) || (showOutput == ShowOutput.Error && code == 1)) {
        if (showOutputInTerminal) {
          this.executeInTerminal(terminalCommand, terminalArgs, workingDirectory);
        } else {
          this.outputChannel.show();
        }
      }

      vscode.workspace.getConfiguration("phpunit").scriptsAfterTests[status]
        .forEach((script: any) => {
          if (typeof script === "string") {
            cp.spawn(script);
          } else {
            cp.spawn(script.command, script.args);
          }
        });
    });

    phpunitProcess.on("exit", (code, signal) => {
      if (signal != null) {
        this.outputChannel.append("Cancelled");
        this.outputChannel.appendLine("\n-------------------------------------------------------\n");
      }
    });

    if (showOutput == ShowOutput.Always) {
      if (showOutputInTerminal) {
        this.executeInTerminal(terminalCommand, terminalArgs, workingDirectory);
      } else {
        this.outputChannel.show();
      }
    }
  }

  /**
   * Stop running the current test.
   */
  static cancelCurrentTest() {
    if (PhpUnit.currentTest) {
      PhpUnit.currentTest.kill();
      PhpUnit.currentTest = null;
    } else {
      vscode.window.showInformationMessage("There are no tests running.");
    }
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
        workingDirectory = PathHelper.findWorkingDirectory();
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
   * @param phpunitPath - The executable path for PHP Unit.
   * @param workingDirectory  - The working directory the child process spawns in.
   * @param terminalCommand - Is the command being run in the terminal.
   */
  private getCommand(phpunitPath: string, workingDirectory: string, terminalCommand = false): string {
    const sshCommand = SharedConfiguration.ssh_command() ? SharedConfiguration.ssh_command() + " " : "";
    const dockerCommand = SharedConfiguration.docker_command() ? SharedConfiguration.docker_command() + " " : "";
    let command = phpunitPath;

    PhpUnit.lastCommand = {
      phpunitPath,
      workingDirectory,
      args: this.args.slice(),
      putFsPathIntoArgs: false
    };

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

    if (this.putFsPathIntoArgs) {
      const fsPath = PathHelper.remapLocalPath(vscode.window.activeTextEditor.document.uri.fsPath);

      args.push(fsPath);
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
