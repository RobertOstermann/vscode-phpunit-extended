import * as vscode from 'vscode';

export class OptionsHelper {
  static appendItemOutput(item: vscode.TestItem, options: vscode.TestRun, message: string): void {
    const location = new vscode.Location(item.uri, item.range);

    options.appendOutput(message, location, item);
  }

  static appendOutput(item: vscode.TestItem, options: vscode.TestRun, message: string): void {
    options.appendOutput(`\r\n${message}\r\n`, null, item);
  }

  static appendPassedOutput(item: vscode.TestItem, options: vscode.TestRun, message?: string, output?: string, duration?: number): void {
    if (duration) {
      options.passed(item, duration);
    } else {
      options.passed(item);
    }

    if (message) {
      OptionsHelper.appendItemOutput(item, options, message);
    }

    if (output) {
      OptionsHelper.appendOutput(item, options, output);
    }
  }

  static appendFailedOutput(item: vscode.TestItem, options: vscode.TestRun, message?: string, output?: string, duration?: number): void {
    if (duration) {
      options.failed(item, [], duration);
    } else {
      options.failed(item, []);
    }

    if (message) {
      OptionsHelper.appendItemOutput(item, options, message);
    }

    if (output) {
      OptionsHelper.appendOutput(item, options, output);
    }
  }
}
