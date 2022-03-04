import * as vscode from "vscode";

import SharedConfiguration from "../Helpers/configuration";
import TestExplorerConfiguration from "./Helpers/configuration";
import OutputHelper from "./Helpers/outputHelper";
import TestResult from "./Helpers/testResult";
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
    const args = [...SharedConfiguration.args(), ...TestExplorerConfiguration.args()];

    if (SharedConfiguration.configurationPath()) {
      args.unshift(SharedConfiguration.configurationPath());
      args.unshift("--configuration");
    }

    if (this.currentTest) {
      args.push("--filter");
      args.push(this.currentTest);

      const phpUnit = new TestRunner(args, this.fsPath);
      const result: TestResult = await phpUnit.run();
      const duration = Date.now() - start;

      if (result.success) {
        OutputHelper.appendPassedOutput(item, options, result, duration);
      } else {
        OutputHelper.appendFailedOutput(item, options, result, duration);
      }
    } else {
      const testMessage = new vscode.TestMessage(`${item.label} not found`);
      options.failed(item, testMessage);
    }
  }
}
