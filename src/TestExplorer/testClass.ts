import * as vscode from "vscode";

import SharedConfiguration from "../Helpers/configuration";
import TestExplorerConfiguration from "./Helpers/configuration";
import Constants from "./Helpers/constants";
import OutputHelper from "./Helpers/outputHelper";
import TestResult from "./Helpers/testResult";
import TestRunner from "./testRunner";
import TestRunnerHelper from "./testRunnerHelper";

export default class TestClass {
  private currentTest: string;
  private fsPath: string;
  public generation: number;

  /**
   * Initialize the test class.
   * 
   * @param currentTest - The name of the test.
   * @param fsPath - The file path to the test.
   * @param generation - The generation of the test.
   */
  constructor(currentTest: string, fsPath: vscode.Uri, generation: number) {
    this.currentTest = currentTest;
    this.fsPath = fsPath.fsPath;
    this.generation = generation;
  }

  /**
   * Execute the given test class and append the test output.
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

      let error = false;

      if (result?.success) {
        OutputHelper.appendPassedOutput(item, options, result, duration);
      } else {
        if (result?.message === Constants.timeoutMessage) {
          error = true;
        } else {
          const { errorStatus, errorOutput } = TestRunnerHelper.parsePhpUnitOutputForClassTest(result.output);
          error = errorStatus;
          result.message = errorOutput;
        }
        result.line = undefined;
        OutputHelper.appendFailedOutput(item, options, result, duration);
      }

      if (!TestExplorerConfiguration.verboseTestExplorerOutput()) {
        this.populateChildTestOutput(item, options, result.output, result.success, error);
      }
    } else {
      OutputHelper.appendFailedOutput(item, options);
    }
  }

  /**
   * This is useful when running class tests.
   * Appends the success or error status to each individual test.
   * Does not currently append an output message to passing tests.
   * 
   * @param parent - The test item.
   * @param options - The test run options.
   * @param output - The output of the test.
   * @param success - The success status of the test.
   * @param error - The error status of the test.
   */
  private populateChildTestOutput(parent: vscode.TestItem, options: vscode.TestRun, output: string, success: boolean, error: boolean) {
    parent.children.forEach(item => {
      const testResult = TestRunnerHelper.parsePhpUnitOutputForIndividualTest(output, item.label, item.uri.fsPath);

      if (success || (testResult === Constants.individualTestPassedMessage && !error)) {
        OutputHelper.appendPassedOutput(item, options, testResult);
      } else {
        if (error) {
          OutputHelper.appendFailedOutput(item, options);
        } else {
          OutputHelper.appendFailedOutput(item, options, testResult);
        }
      }
    });
  }
}
