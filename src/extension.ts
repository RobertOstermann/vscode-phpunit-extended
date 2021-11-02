import * as vscode from 'vscode';
import Commands from './commands';
import TestCase from './TestExplorer/TestCase';
import { testData, TestFile } from './TestExplorer/TestFile';

export async function activate(context: vscode.ExtensionContext) {
	Commands.registerCommands(context);

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
					if (data instanceof TestFile && !data.didResolve) {
						await data.updateFromDisk(controller, test);
					}

					await discoverTests(gatherTestItems(test.children));
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

	function updateNodeForDocument(document: vscode.TextDocument) {
		if (document.uri.scheme !== 'file') {
			return;
		}

		if (!document.uri.path.endsWith('.php')) {
			return;
		}

		// TODO: Add ability to make the pattern case sensitive
		const fileRegexString: string = vscode.workspace
			.getConfiguration("phpunit")
			.get("fileRegex");
		const fileRegex = new RegExp(fileRegexString, 'gi');

		if (!fileRegex.exec(document.uri.path)) {
			return;
		}

		const { file, data } = getOrCreateFile(controller, document.uri);

		data.updateFromContents(controller, document.getText(), file);
	}

	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(document => updateNodeForDocument(document)),
		vscode.workspace.onDidChangeTextDocument(editor => updateNodeForDocument(editor.document)),
		vscode.window.onDidChangeActiveTextEditor(editor => updateNodeForDocument(editor.document)),
	);

	if (vscode.window.activeTextEditor) {
		updateNodeForDocument(vscode.window.activeTextEditor.document);
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
