import * as vscode from "vscode";

export default class OptionsHelper {
  /**
   * Appends a passed output to the given test and
   * appends the full output to the test output.
   * 
   * @param item - The test item to append output to.
   * @param options - The test options.
   * @param message - The message to append.
   * @param output - The full output to append to the test output.
   * @param duration - The time the test took to complete.
   */
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

  /**
   * Appends a failed output to the given test and
   * appends the full output to the test output.
   * 
   * @param item - The test item to append output to.
   * @param options - The test options.
   * @param message - The message to append.
   * @param output - The full output to append to the test output.
   * @param duration - The time the test took to complete.
   */
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

  /**
   * Appends the output to the individual item.
   * 
   * @param item - The test item to append the output to.
   * @param options - The test options.
   * @param message - The message to append.
   */
  private static appendItemOutput(item: vscode.TestItem, options: vscode.TestRun, message: string): void {
    const location = new vscode.Location(item.uri, item.range);

    options.appendOutput(message, location, item);
  }

  /**
   * Appends the output to the test output.
   * 
   * @param item - The test item to pass or fail.
   * @param options - The test options.
   * @param message - The message to append.
   */
  private static appendOutput(item: vscode.TestItem, options: vscode.TestRun, message: string): void {
    options.appendOutput(`\r\n${message}\r\n`, null, item);
  }
}
