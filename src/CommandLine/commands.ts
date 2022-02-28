import * as vscode from "vscode";

import OutputHelper from "../TestExplorer/Helpers/outputHelper";
import { TestRunner } from "./phpUnitTest";

export default class Commands {
  static PHPUnitTestRunner: TestRunner = new TestRunner(OutputHelper.outputChannel);

  /**
   * Register the extension commands with VSCode.
   * 
   * @param context - The VSCode extension context.
   */
  public static registerCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("phpunit.Test", () => {
      Commands.PHPUnitTestRunner.runTest();
    }));

    context.subscriptions.push(vscode.commands.registerCommand("phpunit.TestFile", () => {
      Commands.PHPUnitTestRunner.runCurrentFileTest();
    }));

    context.subscriptions.push(vscode.commands.registerCommand("phpunit.TestSuite", () => {
      Commands.PHPUnitTestRunner.runTestSuite();
    }));

    context.subscriptions.push(vscode.commands.registerCommand("phpunit.TestSuiteWithExclusions", () => {
      Commands.PHPUnitTestRunner.runTestSuiteWithExclusions();
    }));

    context.subscriptions.push(vscode.commands.registerCommand("phpunit.TestNearest", () => {
      Commands.PHPUnitTestRunner.runNearestTest();
    }));

    context.subscriptions.push(vscode.commands.registerCommand("phpunit.LastTest", () => {
      Commands.PHPUnitTestRunner.runLastTest();
    }));

    context.subscriptions.push(vscode.commands.registerCommand("phpunit.CancelCurrentTest", () => {
      Commands.PHPUnitTestRunner.cancelCurrentTest();
    }));
  }
}
