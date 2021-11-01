import * as vscode from 'vscode';
import { Helper } from '../Helper';
import { PhpUnit } from '../PhpUnit';

export class SelectWindowTest {

    private editor: vscode.TextEditor;
    private args: string[];
    private outputChannel: vscode.OutputChannel;

    constructor(editor: vscode.TextEditor, args: string[], outputChannel: vscode.OutputChannel) {
        this.editor = editor;
        this.args = args;
        this.outputChannel = outputChannel;
    }

    public run() {
        let range = this.editor
            ? this.editor.document.getWordRangeAtPosition(this.editor.selection.active)
            : null;

        if (range) {
            let line = this.editor.document.lineAt(range.start.line);
            var wordOnCursor = this.editor.document.getText(range);
            var isFunction = line.text.indexOf("function") != -1;
            var isClass = line.text.indexOf("class") != -1;

            if (isFunction && wordOnCursor != null) {
                this.args.push("--filter");
                this.args.push(wordOnCursor);
            }

            if ((isFunction && wordOnCursor != null) || isClass) {
                (new PhpUnit(this.outputChannel, this.args)).run();
                return;
            }
        }

        this.getUserSelectedTest().then((selectedTest) => {
            if (selectedTest) {
                if (selectedTest.indexOf('function - ') != -1) {
                    this.args.push("--filter");
                    this.args.push(selectedTest.replace('function - ', ''));
                }

                // Run test selected in quick pick window.
                (new PhpUnit(this.outputChannel, this.args)).run();
            }
        });
    }

    private getUserSelectedTest(): Thenable<any> | null {
        if (this.editor.document.fileName != null) {
            let helper = new Helper;
            let testFunctions = [];

            let currentTest = helper.getClassNameOrMethod(this.editor, 'method');
            if (currentTest) {
                testFunctions.push('function - ' + currentTest);
            }

            testFunctions.push('class - ' + helper.getClassNameOrMethod(this.editor, 'class'));

            let windowText = this.editor.document.getText();
            let result = null;

            while ((result = helper.getRegex().method.exec(windowText))) {
                let testToAdd = result[2].toString().trim();

                if (!testFunctions.length || testFunctions[0] != testToAdd) {
                    testFunctions.push('function - ' + testToAdd);
                }
            }

            return vscode.window.showQuickPick(testFunctions, {});
        }

        return null;
    }
}
