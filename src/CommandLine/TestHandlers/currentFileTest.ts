import * as vscode from "vscode";

import PhpUnit from "../phpUnit";

export class CurrentFileTest {
  private args: string[];
  private outputChannel: vscode.OutputChannel;

  /**
   * @param args - The arguments to pass into the command.
   * @param outputChannel - The output channel to display the results.
   */
  constructor(args: string[], outputChannel: vscode.OutputChannel) {
    this.args = args;
    this.outputChannel = outputChannel;
  }

  /**
   * Run the test class using {@link PhpUnit}.
   */
  public run() {
    (new PhpUnit(this.outputChannel, this.args)).run();
  }
}
