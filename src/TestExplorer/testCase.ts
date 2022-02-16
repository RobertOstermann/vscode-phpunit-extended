import * as vscode from "vscode";

import TestExplorerConfiguration from "./Helpers/configuration";
import OutputHelper from "./Helpers/outputHelper";
import TestRunner from "./testRunner";

export default class TestCase {
  private currentTest: string;
  private fsPath: string;
  public generation: number;

  /**
   * Initialize the test case.
   * 
   * @param currentTest - The name of the test.
   * @param fsPath - The file path to the test.
   * @param generation - The level of the test.
   */
  constructor(currentTest: string, fsPath: vscode.Uri, generation: number) {
    this.currentTest = currentTest;
    this.fsPath = fsPath.fsPath;
    this.generation = generation;
  }

  /**
   * Execute the given test case and append the test output.
   * 
   * @param item - The test item to run.
   * @param options - The test run options.
   */
  async run(item: vscode.TestItem, options: vscode.TestRun) {
    const start = Date.now();
    const args = [...TestExplorerConfiguration.sharedArgs(), ...TestExplorerConfiguration.args()];

    if (TestExplorerConfiguration.configurationPath()) {
      args.unshift(TestExplorerConfiguration.configurationPath());
      args.unshift("--configuration");
    }

    if (this.currentTest) {
      args.push("--filter");
      args.push(this.currentTest);

      const phpUnit = new TestRunner(args, this.fsPath);
      const { success, message, output } = await phpUnit.run();
      const duration = Date.now() - start;

      if (success) {
        OutputHelper.appendPassedOutput(item, options, message, output, duration);
      } else {
        OutputHelper.appendFailedOutput(item, options, message, output, duration);
      }
    } else {
      const testMessage = new vscode.TestMessage(`${item.label} not found`);
      options.failed(item, testMessage);
    }
  }
}
