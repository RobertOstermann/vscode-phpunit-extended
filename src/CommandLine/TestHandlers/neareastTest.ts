import * as vscode from "vscode";

import Helper from "../Helpers/helper";
import PhpUnit from "../phpUnit";

export class NeareastTest {
  private editor: vscode.TextEditor;
  private args: string[];
  private outputChannel: any;

  /**
   * @param editor - The VSCode text editor.
   * @param args - The arguments to pass into the command.
   * @param outputChannel - The output channel to display the results.
   */
  constructor(editor: vscode.TextEditor, args: string[], outputChannel: vscode.OutputChannel) {
    this.editor = editor;
    this.args = args;
    this.outputChannel = outputChannel;
  }

  /**
   * Run the test closest to the cursor using {@link PhpUnit}.
   */
  public run() {
    if (this.editor.document.fileName == null) {
      return;
    }

    const currentTest = Helper.getClassNameOrMethod(this.editor, "method");

    if (currentTest) {
      this.args.push("--filter");
      this.args.push(currentTest);

      (new PhpUnit(this.outputChannel, this.args)).run();
    }
  }
}
