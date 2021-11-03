// export default class TestClass {
//   constructor(public generation: number) { }
// }

import * as vscode from 'vscode';
import TestRunner from './testRunner';
import TestRunnerHelper from './testRunnerHelper';

export default class TestClass {
  private currentTest: string;
  private fsPath: string;
  public generation: number;

  constructor(currentTest: string, fsPath: vscode.Uri, generation: number) {
    this.currentTest = currentTest;
    this.fsPath = fsPath.fsPath;
    this.generation = generation;
  }

  async run(item: vscode.TestItem, options: vscode.TestRun) {
    const start = Date.now();
    let config = vscode.workspace.getConfiguration("phpunit");
    let args = [].concat(config.get<Array<string>>("args", []));

    if (this.currentTest) {
      args.push("--filter");
      args.push(this.currentTest);

      const phpUnit = new TestRunner(args, this.fsPath);
      const { success, message, output } = await phpUnit.run();
      const duration = Date.now() - start;
      const location = new vscode.Location(item.uri!, item.range!);
      let error = false;

      if (success) {
        options.passed(item, duration);
        options.appendOutput(message, location, item);
        options.appendOutput(output);
      } else {
        const errorMessage = TestRunnerHelper.parsePhpUnitOutputForClassTest(output);
        error = errorMessage === "Test Failed: Check Terminal Output" ? true : false;
        options.failed(item, [], duration);
        options.appendOutput(errorMessage, location, item);
        options.appendOutput(output);
      }

      this.populateChildTestOutput(item, options, output, success, error);
    } else {
      const testMessage = new vscode.TestMessage(`${item.label} not found`);
      options.failed(item, testMessage);
    }
  }

  private populateChildTestOutput(parent: vscode.TestItem, options: vscode.TestRun, output: string, success: boolean, error: boolean) {
    parent.children.forEach(item => {
      const location = new vscode.Location(item.uri!, item.range!);
      const testResult = TestRunnerHelper.parsePhpUnitOutputForIndividualTest(output, item.label);

      if (success && testResult === 'OK' && !error) {
        options.passed(item);
        // options.appendOutput(testResult, location, item);
      } else {
        options.failed(item, []);
        options.appendOutput(error ? "" : testResult, location, item);
      }
    });
  }
}