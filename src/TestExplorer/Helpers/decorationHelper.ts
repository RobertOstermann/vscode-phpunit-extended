import * as vscode from "vscode";

export default class DecorationHelper {
  static failedDecorations: FailedDecorations[] = [];

  static failedTestDecoratorOptions: vscode.DecorationRenderOptions = {
    isWholeLine: true,
    backgroundColor: "red"
  };

  static failedTestDecorationType = vscode.window.createTextEditorDecorationType(this.failedTestDecoratorOptions);

  /**
   * Adds a background color to a given line.
   * 
   * @param item - The test item that needs a decoration.
   * @param line - The line to add the decoration to.
   */
  static addDecorations(item: vscode.TestItem, line: number): void {
    const editor = vscode.window.activeTextEditor;
    const document = editor?.document;
    if (!editor || !document || !line) {
      return;
    }

    const range = document.lineAt(line - 1).range;
    const decorationOptions: vscode.DecorationOptions = { range: range };
    const failedDecoration = {
      item: item,
      decoration: decorationOptions
    };

    this.failedDecorations.push(failedDecoration);
  }
}

interface FailedDecorations {
  item: vscode.TestItem;
  decoration: vscode.DecorationOptions,
}
