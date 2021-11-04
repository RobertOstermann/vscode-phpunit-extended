import * as vscode from 'vscode';
import { TestRunner } from './phpUnitTest';

export default class Commands {
  static outputChannel = vscode.window.createOutputChannel("phpunit");
  static PHPUnitTestRunner: TestRunner = new TestRunner(Commands.outputChannel);

  public static registerCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('phpunit.Test', () => {
      Commands.PHPUnitTestRunner.runTest();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('phpunit.TestFile', () => {
      Commands.PHPUnitTestRunner.runCurrentFileTest();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('phpunit.TestSuite', () => {
      Commands.PHPUnitTestRunner.runTestSuite();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('phpunit.TestSuiteWithExclusions', () => {
      Commands.PHPUnitTestRunner.runTestSuiteWithExclusions();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('phpunit.TestNearest', () => {
      Commands.PHPUnitTestRunner.runNearestTest();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('phpunit.LastTest', () => {
      Commands.PHPUnitTestRunner.runLastTest();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('phpunit.CancelCurrentTest', () => {
      Commands.PHPUnitTestRunner.cancelCurrentTest();
    }));
  }
}