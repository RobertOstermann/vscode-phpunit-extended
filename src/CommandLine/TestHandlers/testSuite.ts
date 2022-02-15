import * as vscode from "vscode";

import CommandLineConfiguration from "../Helpers/configuration";
import PhpUnit from "../phpUnit";

export class TestSuite {

  private args: string[];
  private outputChannel: vscode.OutputChannel;
  private withExclusions: boolean;

  constructor(args: string[], outputChannel: vscode.OutputChannel, withExclusions = false) {
    this.args = args;
    this.outputChannel = outputChannel;
    this.withExclusions = withExclusions;
  }

  public run() {
    if (this.withExclusions) {
      this.args.push("--exclude-group");
      this.args.push(CommandLineConfiguration.excludedGroups().join(","));
    }

    (new PhpUnit(this.outputChannel, this.args, false)).run();
  }
}
