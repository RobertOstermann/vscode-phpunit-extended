import * as vscode from 'vscode';
import { TestRunner } from './PhpUnitTest';

export function activate(context: vscode.ExtensionContext) {

	let outputChannel = vscode.window.createOutputChannel("phpunit");
	let PHPUnitTestRunner: TestRunner = new TestRunner(outputChannel);

	context.subscriptions.push(vscode.commands.registerCommand('phpunit.Test', () => {
		PHPUnitTestRunner.runTest();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('phpunit.TestFile', () => {
		PHPUnitTestRunner.runCurrentFileTest();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('phpunit.TestSuite', () => {
		PHPUnitTestRunner.runTestSuite();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('phpunit.TestSuiteWithExclusions', () => {
		PHPUnitTestRunner.runTestSuiteWithExclusions();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('phpunit.TestNearest', () => {
		PHPUnitTestRunner.runNearestTest();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('phpunit.LastTest', () => {
		PHPUnitTestRunner.runLastTest();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('phpunit.CancelCurrentTest', () => {
		PHPUnitTestRunner.cancelCurrentTest();
	}));
}
