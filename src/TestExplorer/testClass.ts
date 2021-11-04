import * as vscode from 'vscode';

import { Constants } from './Helpers/constants';
import { OptionsHelper } from './Helpers/optionsHelper';
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
    const config = vscode.workspace.getConfiguration("phpunit");
    const args = [].concat(config.get<Array<string>>("args", []));

    if (this.currentTest) {
      args.push("--filter");
      args.push(this.currentTest);

      const phpUnit = new TestRunner(args, this.fsPath);
      const { success, message, output } = await phpUnit.run();
      const duration = Date.now() - start;

      let errorMessage = "";
      let error = false;

      if (success) {
        OptionsHelper.appendPassedOutput(item, options, message, output, duration);
      } else {
        if (message === Constants.timeoutMessage) {
          errorMessage = message;
          error = true;
        } else {
          const { errorStatus, errorOutput } = TestRunnerHelper.parsePhpUnitOutputForClassTest(output);
          error = errorStatus;
          errorMessage = errorOutput;
        }
        OptionsHelper.appendFailedOutput(item, options, errorMessage, output, duration);
      }

      this.populateChildTestOutput(item, options, output, success, error);
    } else {
      OptionsHelper.appendFailedOutput(item, options);
    }
  }

  private populateChildTestOutput(parent: vscode.TestItem, options: vscode.TestRun, output: string, success: boolean, error: boolean) {
    parent.children.forEach(item => {
      const testResult = TestRunnerHelper.parsePhpUnitOutputForIndividualTest(output, item.label);

      if (success || (testResult === Constants.individualTestPassedMessage && !error)) {
        OptionsHelper.appendPassedOutput(item, options);
      } else {
        if (error) {
          OptionsHelper.appendFailedOutput(item, options);
        } else {
          OptionsHelper.appendFailedOutput(item, options, testResult);
        }
      }
    });
  }
}