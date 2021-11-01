import * as vscode from 'vscode';
import { Helper } from './helper';
import { TestRunner } from './phpUnitTest';

const controller = vscode.tests.createTestController('PHPUnitTests', 'PHPUnit Tests');

function parseCurrentFile(editor: vscode.TextEditor) {
	if (!(editor && editor.document.languageId === 'php')) {
		return;
	}

	let tests = Helper.getAvailableTests(editor);

	console.log('parseCurrentFile');
	tests.forEach((test, index) => {
		let testItem = controller.createTestItem(index.toString(), test);
		controller.items.add(testItem);
	});
}

export function activate(context: vscode.ExtensionContext) {
	let activeEditor = vscode.window.activeTextEditor;
	let outputChannel = vscode.window.createOutputChannel("phpunit");
	let PHPUnitTestRunner: TestRunner = new TestRunner(outputChannel);

	if (activeEditor) {
		parseCurrentFile(activeEditor);
	}

	vscode.window.onDidChangeActiveTextEditor(
		(editor) => {
			activeEditor = editor;
			parseCurrentFile(activeEditor);
		}
	);

	vscode.workspace.onDidChangeTextDocument(
		(event) => {
			parseCurrentFile(activeEditor);
		},
		null,
		context.subscriptions
	);

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
