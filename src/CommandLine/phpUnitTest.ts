import * as vscode from "vscode";

import SharedConfiguration from "../Helpers/configuration";
import CommandLineConfiguration from "./Helpers/configuration";
import PhpUnit from "./phpUnit";
import { CurrentFileTest } from "./TestHandlers/currentFileTest";
import { NeareastTest } from "./TestHandlers/neareastTest";
import { RunLastTest } from "./TestHandlers/runLastTest";
import { SelectWindowTest } from "./TestHandlers/selectWindowTest";
import { TestSuite } from "./TestHandlers/testSuite";
import { TestHandler } from "./utils";

export class TestRunner {
  private outputChannel: vscode.OutputChannel;

  constructor(channel: vscode.OutputChannel) {
    this.outputChannel = channel;
  }

  /**
   * Open a window to select the test to run.
   */
  public runTest() {
    this.executeTest("select-window");
  }

  /**
   * Execute the current file.
   */
  public runCurrentFileTest() {
    this.executeTest("current-file");
  }

  /**
   * Execute a test suite.
   */
  public runTestSuite() {
    this.executeTest("suite");
  }

  /**
   * Execute a test suite with exclusions.
   */
  public runTestSuiteWithExclusions() {
    this.executeTest("suite-with-exclusions");
  }

  /**
   * Execute the test closest to the cursor.
   */
  public runNearestTest() {
    this.executeTest("nearest");
  }

  /**
   * Re-run the previous command.
   */
  public runLastTest() {
    this.executeTest("last");
  }

  /**
   * Cancel the test that is currently running.
   */
  public cancelCurrentTest() {
    PhpUnit.cancelCurrentTest();
  }

  /**
   * Execute the test given the type of the test.
   * 
   * @param type - The test to run.
   */
  private executeTest(type: string) {
    const args = [...SharedConfiguration.args(), ...CommandLineConfiguration.args()];
    const editor = vscode.window.activeTextEditor;
    let testHandler: TestHandler;

    if (SharedConfiguration.configurationPath()) {
      args.unshift(SharedConfiguration.configurationPath());
      args.unshift("--configuration");
    }

    switch (type) {
      case "select-window":
        testHandler = new SelectWindowTest(editor, args, this.outputChannel);
        break;
      case "current-file":
        testHandler = new CurrentFileTest(args, this.outputChannel);
        break;
      case "suite":
        testHandler = new TestSuite(args, this.outputChannel);
        break;
      case "suite-with-exclusions":
        testHandler = new TestSuite(args, this.outputChannel, true);
        break;
      case "nearest":
        testHandler = new NeareastTest(editor, args, this.outputChannel);
        break;
      case "last":
        testHandler = new RunLastTest(this.outputChannel);
        break;
    }

    testHandler.run();
  }
}
