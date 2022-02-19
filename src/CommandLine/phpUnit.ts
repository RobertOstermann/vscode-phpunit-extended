/* eslint-disable no-useless-escape */
import * as vscode from "vscode";
import cp = require("child_process");
import { SpawnOptions } from "child_process";

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
    const phpunitPath = CommandLineConfiguration.execPath();

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
    this.outputChannel.clear();

    const workingDirectory = this.getWorkingDirectory();
    if (workingDirectory === null) {
      const errorMessage = "Couldn't find a working directory.";
      vscode.window.showErrorMessage(errorMessage);
      return { success: false, output: errorMessage };
    }

    const command = this.getCommand(phpunitPath, workingDirectory);
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

    this.outputChannel.appendLine(`${phpunitPath} ${this.args.join(" ")}\n`);

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
        this.outputChannel.show();
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
      this.outputChannel.show();
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

  /**
   * Sets the arguments for the node process.
   * 
   * @param phpunitPath - The executable path for PHP Unit.
   * @param workingDirectory  - The working directory the child process spawns in.
   */
  private getCommand(phpunitPath: string, workingDirectory: string): string {
    this.setArguments(phpunitPath);
    let command = "";

    PhpUnit.lastCommand = {
      phpunitPath,
      workingDirectory,
      args: this.args.slice(),
      putFsPathIntoArgs: false
    };

    if (/^win/.test(process.platform)) {
      command = "cmd";
      this.args.unshift(phpunitPath);
      this.args.unshift("/c");
    } else {
      command = phpunitPath;
    }

    return command;
  }

  /**
   * Sets the arguments for the node process.
   * 
   * @param phpunitPath - The executable path for PHP Unit.
   */
  private setArguments(phpunitPath: string) {
    if (this.putFsPathIntoArgs) {
      const fsPath = PathHelper.remapLocalPath(vscode.window.activeTextEditor.document.uri.fsPath);

      this.args.push(fsPath);
    }

    if (/^win/.test(process.platform)) {
      this.args.unshift(phpunitPath);
      this.args.unshift("/c");
    }
  }
}
