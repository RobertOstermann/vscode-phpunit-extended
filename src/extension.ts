import * as vscode from 'vscode';
import Commands from './commands';
import TestCase from './TestExplorer/testCase';
import TestClass from './TestExplorer/testClass';
import { testData, TestFile } from './TestExplorer/testFile';

export async function activate(context: vscode.ExtensionContext) {
	Commands.registerCommands(context);

	const controller = vscode.tests.createTestController('PHPUnitTests', 'PHPUnit Tests');
	context.subscriptions.push(controller);

	const runHandler = (request: vscode.TestRunRequest, cancellation: vscode.CancellationToken) => {
		const queue: { test: vscode.TestItem; data: TestClass | TestCase; }[] = [];
		const run = controller.createTestRun(request);

		const discoverTests = async (tests: Iterable<vscode.TestItem>) => {
			for (const test of tests) {
				if (request.exclude?.includes(test)) {
					continue;
				}

				const data = testData.get(test);

				if (data instanceof TestClass || data instanceof TestCase) {
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
			for await (const { test, data } of queue) {
				if (cancellation.isCancellationRequested) {
					run.skipped(test);
				} else {
					run.started(test);
					await data.run(test, run);
				}
			}

			run.end();
		};

		discoverTests(request.include ?? gatherTestItems(controller.items)).then(runTestQueue);
	};

	controller.createRunProfile('Run Tests', vscode.TestRunProfileKind.Run, runHandler, true);

	controller.resolveHandler = async item => {
		if (!item) {
			const discoverAllTests: boolean = vscode.workspace
				.getConfiguration("phpunit")
				.get("discoverAllTests");
			if (discoverAllTests) {
				context.subscriptions.push(...startWatchingWorkspace(controller));
			}
			return;
		}

		const data = testData.get(item);
		if (data instanceof TestFile) {
			await data.updateFromDisk(controller, item);
		}
	};

	function updateNodeForDocument(document: vscode.TextDocument) {
		if (!document || document.uri.scheme !== 'file' || !validTestFilePath(document.uri.path)) {
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
	file.canResolveChildren = true;
	controller.items.add(file);

	const data = new TestFile();
	testData.set(file, data);

	return { file, data };
}

function gatherTestItems(collection: vscode.TestItemCollection) {
	const items: vscode.TestItem[] = [];
	collection.forEach(item => items.push(item));
	return items;
}

function startWatchingWorkspace(controller: vscode.TestController) {
	if (!vscode.workspace.workspaceFolders) {
		return [];
	}

	const folderPattern: string = vscode.workspace
		.getConfiguration("phpunit")
		.get("folderPattern");

	return vscode.workspace.workspaceFolders.map(workspaceFolder => {
		const pattern = new vscode.RelativePattern(workspaceFolder, folderPattern);
		const watcher = vscode.workspace.createFileSystemWatcher(pattern);

		watcher.onDidCreate(uri => {
			if (validTestFilePath(uri.path)) {
				getOrCreateFile(controller, uri);
			}
		});
		watcher.onDidChange(uri => {
			if (validTestFilePath(uri.path)) {
				const { file, data } = getOrCreateFile(controller, uri);
				if (data.didResolve) {
					data.updateFromDisk(controller, file);
				}
			}
		});
		watcher.onDidDelete(uri => {
			controller.items.delete(uri.toString());
		});

		vscode.workspace.findFiles(pattern).then(files => {
			for (const file of files) {
				if (validTestFilePath(file.path)) {
					getOrCreateFile(controller, file);
				}
			}
		});

		return watcher;
	});
}

function validTestFilePath(path: string) {
	// TODO: Add ability to make the pattern case sensitive
	const fileRegexString: string = vscode.workspace
		.getConfiguration("phpunit")
		.get("fileRegex");

	const fileRegex = new RegExp(fileRegexString, 'gi');

	if (fileRegex.exec(path)) {
		return true;
	}

	return false;
}
