import * as vscode from 'vscode';
import TestExplorerConfiguration from './Helpers/configuration';

import OptionsHelper from './Helpers/optionsHelper';
import TestRunner from './testRunner';

export default class TestCase {
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
    let args = [...TestExplorerConfiguration.sharedArgs(), ...TestExplorerConfiguration.args()];

    if (TestExplorerConfiguration.configurationPath()) {
      args.unshift("--configuration");
      args.unshift(TestExplorerConfiguration.configurationPath());
    }

    if (this.currentTest) {
      args.push("--filter");
      args.push(this.currentTest);

      const phpUnit = new TestRunner(args, this.fsPath);
      const { success, message, output } = await phpUnit.run();
      const duration = Date.now() - start;

      if (success) {
        OptionsHelper.appendPassedOutput(item, options, message, output, duration);
      } else {
        OptionsHelper.appendFailedOutput(item, options, message, output, duration);
      }
    } else {
      const testMessage = new vscode.TestMessage(`${item.label} not found`);
      options.failed(item, testMessage);
    }
  }
}