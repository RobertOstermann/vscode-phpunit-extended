import * as vscode from 'vscode';

import Commands from './CommandLine/commands';
import { Configuration } from './TestExplorer/Helpers/configuration';
import TestCase from './TestExplorer/testCase';
import TestClass from './TestExplorer/testClass';
import TestDiscover from './TestExplorer/testDiscover';
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

					await discoverTests(TestDiscover.gatherTestItems(test.children));
				}
			}
		};

		const runTestQueue = async () => {
			let promises = [];
			for await (const { test, data } of queue) {
				if (cancellation.isCancellationRequested) {
					run.skipped(test);
				} else {
					run.started(test);
					promises.push(data.run(test, run));
				}
				if (promises.length === Configuration.parallelTests()) {
					await Promise.all(promises);
					promises = [];
				}
			}

			await Promise.all(promises);

			run.end();
		};

		discoverTests(request.include ?? TestDiscover.gatherTestItems(controller.items)).then(runTestQueue);
	};

	controller.createRunProfile('Run Tests', vscode.TestRunProfileKind.Run, runHandler, true);

	controller.resolveHandler = async item => {
		if (!item) {
			if (Configuration.discoverAllTests()) {
				context.subscriptions.push(...TestDiscover.startWatchingWorkspace(controller));
			}
			return;
		}

		const data = testData.get(item);
		if (data instanceof TestFile) {
			await data.updateFromDisk(controller, item);
		}
	};

	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument((document) =>
			TestDiscover.updateNodeForDocument(controller, document)
		),
		vscode.workspace.onDidChangeTextDocument((editor) =>
			TestDiscover.updateNodeForDocument(controller, editor?.document)
		),
		vscode.window.onDidChangeActiveTextEditor((editor) =>
			TestDiscover.updateNodeForDocument(controller, editor?.document)
		)
	);

	TestDiscover.updateNodeForDocument(controller, vscode.window?.activeTextEditor?.document);
}
