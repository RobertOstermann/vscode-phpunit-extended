import * as vscode from 'vscode';
import Commands from './commands';
import { Helper } from './helper';
import TestCase from './TestExplorer/testCase';
import { testData, TestFile } from './TestExplorer/testFile';

export function activate(context: vscode.ExtensionContext) {
	const controller = vscode.tests.createTestController('PHPUnitTests', 'PHPUnit Tests');
	context.subscriptions.push(controller);

	const runHandler = (request: vscode.TestRunRequest, cancellation: vscode.CancellationToken) => {
		const queue: { test: vscode.TestItem; data: TestCase; }[] = [];
		const run = controller.createTestRun(request);

		const discoverTests = async (tests: Iterable<vscode.TestItem>) => {
			for (const test of tests) {
				if (request.exclude?.includes(test)) {
					continue;
				}

				const data = testData.get(test);

				if (data instanceof TestCase) {
					run.enqueued(test);
					queue.push({ test, data });
				} else {
					continue;
				}
			}
		};

		const runTestQueue = async () => {
			for (const { test, data } of queue) {
				run.appendOutput(`Running ${test.id}\r\n`);
				if (cancellation.isCancellationRequested) {
					run.skipped(test);
				} else {
					run.started(test);
					await data.run(test, run);
				}

				run.appendOutput(`Completed ${test.id}\r\n`);
			}

			run.end();
		};

		discoverTests(request.include ?? gatherTestItems(controller.items)).then(runTestQueue);
	};

	controller.createRunProfile('Run Tests', vscode.TestRunProfileKind.Run, runHandler, true);

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => updateNodeForDocument(editor.document)),
		vscode.workspace.onDidOpenTextDocument(document => updateNodeForDocument(document)),
		vscode.workspace.onDidChangeTextDocument(editor => updateNodeForDocument(editor.document)),
	);

	Commands.registerCommands(context);

	function updateNodeForDocument(document: vscode.TextDocument) {
		if (document.uri.scheme !== 'file') {
			return;
		}

		if (!document.uri.path.endsWith('.php')) {
			return;
		}

		const { file, data } = getOrCreateFile(controller, document.uri);

		data.updateFromContents(controller, document.getText(), file);
	}
}

function getOrCreateFile(controller: vscode.TestController, uri: vscode.Uri) {
	const existing = controller.items.get(uri.toString());
	if (existing) {
		return { file: existing, data: testData.get(existing) as TestFile };
	}

	const file = controller.createTestItem(uri.toString(), uri.path.split('/').pop()!, uri);
	controller.items.add(file);

	const data = new TestFile();
	testData.set(file, data);

	file.canResolveChildren = true;
	return { file, data };
}

function gatherTestItems(collection: vscode.TestItemCollection) {
	const items: vscode.TestItem[] = [];
	collection.forEach(item => items.push(item));
	return items;
}
