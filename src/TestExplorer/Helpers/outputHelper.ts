import * as vscode from "vscode";

import DecorationHelper from "./decorationHelper";
import TestResult from "./testResult";

export default class OutputHelper {
  static outputChannel = vscode.window.createOutputChannel("phpunit");

  /**
   * Appends a passed output to the given test and
   * appends the full output to the test output.
   * 
   * @param item - The test item to append output to.
   * @param options - The test options.
   * @param result - The results of the test item.
   * @param duration - The time the test took to complete.
   */
  static appendPassedOutput(item: vscode.TestItem, options: vscode.TestRun, result: TestResult, duration?: number): void {
    if (duration) {
      options.passed(item, duration);
    } else {
      options.passed(item);
    }

    if (result?.message) {
      OutputHelper.appendItemOutput(item, options, result.message);
    }

    if (result?.output) {
      OutputHelper.appendOutput(item, options, result.output);
    }
  }

  /**
   * Appends a failed output to the given test and
   * appends the full output to the test output.
   * 
   * @param item - The test item to append output to.
   * @param options - The test options.
   * @param result - The results of the test item.
   * @param duration - The time the test took to complete.
   */
  static appendFailedOutput(item: vscode.TestItem, options: vscode.TestRun, result?: TestResult, duration?: number): void {
    if (duration) {
      options.failed(item, [], duration);
    } else {
      options.failed(item, []);
    }

    if (result?.message) {
      OutputHelper.appendItemOutput(item, options, result.message);
    }

    if (result?.output) {
      OutputHelper.appendOutput(item, options, result.output);
    }

    if (result?.line) {
      DecorationHelper.addDecorations(item, result.line);
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
