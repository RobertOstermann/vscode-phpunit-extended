import * as vscode from 'vscode';
import Commands from './commands';
import { Helper } from './helper';

export function activate(context: vscode.ExtensionContext) {
	const controller = vscode.tests.createTestController('PHPUnitTests', 'PHPUnit Tests');
	context.subscriptions.push(controller);

	const runHandler = (request: vscode.TestRunRequest, cancellation: vscode.CancellationToken) => {
		// const queue: { test: vscode.TestItem, data: TestCase }[] = [];

	};

	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(document => updateNodeForDocument(document)),
		vscode.workspace.onDidChangeTextDocument(editor => updateNodeForDocument(editor.document)),
	);

	// vscode.window.onDidChangeActiveTextEditor(
	// 	(editor) => {
	// 		activeEditor = editor;
	// 		updateNodeForDocument(activeEditor.document, controller);
	// 	}
	// );

	Commands.registerCommands(context);


	function updateNodeForDocument(document: vscode.TextDocument) {
		if (document.uri.scheme !== 'file') {
			return;
		}

		if (!document.uri.path.endsWith('.php')) {
			return;
		}

		const file = getOrCreateFile(controller, document.uri);
		const tests = Helper.getAvailableTests(document);

		console.log('updateNodeForDocument');
		tests.forEach((test, index) => {
			let testItem = controller.createTestItem(index.toString(), test, file.uri);
			controller.items.add(testItem);
		});
	}
}

function getOrCreateFile(controller: vscode.TestController, uri: vscode.Uri): vscode.TestItem {
	const existing = controller.items.get(uri.toString());

	if (existing) {
		return existing;
	}

	const file = controller.createTestItem(uri.toString(), uri.path.split('/').pop()!, uri);
	controller.items.add(file);

	file.canResolveChildren = true;
	return file;
}
