import * as vscode from "vscode";

import PhpUnit from "../phpUnit";

export class RunLastTest {
  private outputChannel: any;

  /**
   * @param outputChannel - The output channel to display the results.
   */
  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  /**
   * Re-run the previous test using {@link PhpUnit}.
   */
  public run() {
    if (PhpUnit.lastCommand == null) {
      this.outputChannel.appendLine("No previous test available.");
      this.outputChannel.show();
    } else {
      const phpunit = new PhpUnit(
        this.outputChannel,
        PhpUnit.lastCommand.args,
        PhpUnit.lastCommand.putFsPathIntoArgs
      );

      phpunit.execPhpUnit(
        PhpUnit.lastCommand.phpunitPath,
      );
    }
  }
}
