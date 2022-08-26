import * as vscode from "vscode";

import TestExplorerConfiguration from "./configuration";
import TestResult from "./testResult";

export default class DecorationHelper {
  static decorations: Decoration[] = [];
  static failedTestEditorDecorations: EditorDecoration[] = [];
  static skippedTestEditorDecorations: EditorDecoration[] = [];

  static failedTestDecoratorOptions: vscode.DecorationRenderOptions = {
    isWholeLine: true,
    backgroundColor: TestExplorerConfiguration.failedTestBackgroundColor()
  };

  static failedTestDecorationType: vscode.TextEditorDecorationType =
    vscode.window.createTextEditorDecorationType(this.failedTestDecoratorOptions);

  static skippedTestDecoratorOptions: vscode.DecorationRenderOptions = {
    isWholeLine: true,
    backgroundColor: TestExplorerConfiguration.skippedTestBackgroundColor()
  };

  static skippedTestDecorationType: vscode.TextEditorDecorationType =
    vscode.window.createTextEditorDecorationType(this.skippedTestDecoratorOptions);

  /**
   * Sets the decorations in a document.
   */
  static setDecorations(): void {
    const editors = vscode.window.visibleTextEditors;
    this.decorations.forEach(decoration => {
      let editor: vscode.TextEditor = undefined;

      editors.forEach(textEditor => {
        if (textEditor.document.uri.fsPath === decoration.item.uri.fsPath) {
          editor = textEditor;
        }
      });
      if (editor) {
        const document = editor.document;
        const range = document.lineAt(decoration.line).range;
        const decorationOptions: vscode.DecorationOptions = { range: range };

        if (!decoration.result?.skipped) {
          // Gather the decorations for the failed tests into a single array.
          const failedTestDecorations = this.failedTestEditorDecorations.find(editorDecoration => editorDecoration.editor === editor);
          if (failedTestDecorations) {
            failedTestDecorations.decorations.push(decorationOptions);
          } else {
            const lineDecoration = failedTestDecorations?.decorations.find(lineDecoration => lineDecoration.range === range);
            if (!lineDecoration) {
              const editorDecoration: EditorDecoration = {
                editor: editor,
                decorations: [decorationOptions],
              };
              this.failedTestEditorDecorations.push(editorDecoration);
            }
          }
        } else {
          // Gather the decorations for the skipped tests into a single array.
          const skippedTestDecorations = this.skippedTestEditorDecorations.find(editorDecoration => editorDecoration.editor === editor);
          if (skippedTestDecorations) {
            skippedTestDecorations.decorations.push(decorationOptions);
          } else {
            const lineDecoration = skippedTestDecorations?.decorations.find(lineDecoration => lineDecoration.range === range);
            if (!lineDecoration) {
              const editorDecoration: EditorDecoration = {
                editor: editor,
                decorations: [decorationOptions],
              };
              this.skippedTestEditorDecorations.push(editorDecoration);
            }
          }
        }
      }
    });

    // Set the decorations for the failed tests.
    this.failedTestEditorDecorations.forEach(editorDecoration => {
      editorDecoration.editor.setDecorations(
        this.failedTestDecorationType,
        editorDecoration.decorations
      );
    });

    // Set the decorations for the skipped tests.
    this.skippedTestEditorDecorations.forEach(editorDecoration => {
      editorDecoration.editor.setDecorations(
        this.skippedTestDecorationType,
        editorDecoration.decorations
      );
    });
  }

  /**
   * Adds the decorations to an array.
   * 
   * @param item - The test item that needs a decoration.
   * @param line - The line to add the decoration to.
   */
  static addDecorations(item: vscode.TestItem, result: TestResult): void {
    const editor = vscode.window.activeTextEditor;
    const document = editor?.document;
    if (!editor || !document || !result?.line) {
      return;
    }

    const decoration = {
      item: item,
      line: result.line - 1,
      result: result
    };

    this.decorations.push(decoration);
  }

  /**
   * Removes the decorations from the array.
   * 
   * @param document - The document that has been changed.
   */
  static removeDecorations(document: vscode.TextDocument): void {
    const editors = vscode.window.visibleTextEditors;
    let editor: vscode.TextEditor = undefined;

    editors.forEach(textEditor => {
      if (textEditor.document.uri.fsPath === document.uri.fsPath) {
        editor = textEditor;
      }
    });

    this.decorations = this.decorations.filter(decoration => decoration.item.uri.fsPath !== document.uri.fsPath);
    this.failedTestEditorDecorations.forEach(editorDecoration => {
      if (editorDecoration.editor.document === document) {
        editorDecoration.decorations = [];
      }
    });
    this.skippedTestEditorDecorations.forEach(editorDecoration => {
      if (editorDecoration.editor.document === document) {
        editorDecoration.decorations = [];
      }
    });

    editor.setDecorations(
      this.failedTestDecorationType,
      []
    );
    editor.setDecorations(
      this.skippedTestDecorationType,
      []
    );

    this.setDecorations();
  }
}

interface Decoration {
  item: vscode.TestItem,
  line: number,
  result: TestResult,
  decoration?: vscode.DecorationOptions,
}

interface EditorDecoration {
  editor: vscode.TextEditor,
  decorations: vscode.DecorationOptions[],
}
