import * as vscode from 'vscode';
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
    let config = vscode.workspace.getConfiguration("phpunit");
    let args = [].concat(config.get<Array<string>>("args", []));

    if (this.currentTest) {
      args.push("--filter");
      args.push(this.currentTest);

      let phpUnit = new TestRunner(args, this.fsPath);
      const { success, message, output } = await phpUnit.run();
      const duration = Date.now() - start;
      let location = new vscode.Location(item.uri!, item.range!);

      if (success) {
        options.passed(item, duration);
        options.appendOutput(message, location, item);
        options.appendOutput(output);
      } else {
        options.failed(item, [], duration);
        options.appendOutput(message, location, item);
        options.appendOutput(output);
      }
    } else {
      const testMessage = new vscode.TestMessage(`${item.label} not found`);
      options.failed(item, testMessage);
    }
  }
}