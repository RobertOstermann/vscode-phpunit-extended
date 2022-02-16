import * as vscode from "vscode";

import CommandLineConfiguration from "../Helpers/configuration";
import PhpUnit from "../phpUnit";

export class TestSuite {

  private args: string[];
  private outputChannel: vscode.OutputChannel;
  private withExclusions: boolean;

  /**
   * @param args - The arguments to pass into the command.
   * @param outputChannel - The output channel to display the results.
   * @param withExclusions - Run the test with excluded groups.
   */
  constructor(args: string[], outputChannel: vscode.OutputChannel, withExclusions = false) {
    this.args = args;
    this.outputChannel = outputChannel;
    this.withExclusions = withExclusions;
  }

  /**
   * Run the test suite using {@link PhpUnit}.
   */
  public run() {
    if (this.withExclusions) {
      this.args.push("--exclude-group");
      this.args.push(CommandLineConfiguration.excludedGroups().join(","));
    }

    (new PhpUnit(this.outputChannel, this.args, false)).run();
  }
}
