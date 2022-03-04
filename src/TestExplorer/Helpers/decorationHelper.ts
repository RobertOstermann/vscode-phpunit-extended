import * as vscode from "vscode";

export default class DecorationHelper {
  static decorations: Decoration[] = [];
  static editorDecorations: EditorDecoration[] = [];

  static failedTestDecoratorOptions: vscode.DecorationRenderOptions = {
    isWholeLine: true,
    backgroundColor: "red"
  };

  static failedTestDecorationType = vscode.window.createTextEditorDecorationType(this.failedTestDecoratorOptions);

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

        const editorDecoration = this.editorDecorations.find(editorDecoration => editorDecoration.editor === editor);
        if (editorDecoration) {
          editorDecoration.decorations.push(decorationOptions);
        } else {
          const lineDecoration = editorDecoration?.decorations.find(lineDecoration => lineDecoration.range === range);
          if (!lineDecoration) {
            const editorDecoration: EditorDecoration = {
              editor: editor,
              decorations: [decorationOptions]
            };
            this.editorDecorations.push(editorDecoration);
          }
        }
      }
    });

    this.editorDecorations.forEach(editorDecoration => {
      editorDecoration.editor.setDecorations(
        this.failedTestDecorationType,
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
  static addDecorations(item: vscode.TestItem, line: number): void {
    const editor = vscode.window.activeTextEditor;
    const document = editor?.document;
    if (!editor || !document || !line) {
      return;
    }

    const failedDecoration = {
      item: item,
      line: line - 1,
    };

    this.decorations.push(failedDecoration);
  }

  /**
   * Removes the decorations from the array.
   * 
   * @param item - The test item that needs a decoration.
   * @param line - The line to add the decoration to.
   */
  static removeDecorations(document: vscode.TextDocument): void {
    this.editorDecorations.forEach(editorDecoration => {
      if (editorDecoration.editor.document === document) {
        editorDecoration.decorations = [];
      }
    });

    this.decorations = this.decorations.filter(decoration => decoration.item.uri.fsPath !== document.uri.fsPath);

    this.setDecorations();
  }
}

interface Decoration {
  item: vscode.TestItem,
  line: number,
  decoration?: vscode.DecorationOptions,
}

interface EditorDecoration {
  editor: vscode.TextEditor,
  decorations: vscode.DecorationOptions[];
}
