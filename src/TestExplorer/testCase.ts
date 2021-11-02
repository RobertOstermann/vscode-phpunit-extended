import * as vscode from 'vscode';
import PhpUnitTestRunner from './phpUnitTestRunner';

export default class TestCase {
  public generation: number;

  private currentTest: string;

  // private outputChannel: vscode.OutputChannel;

  // constructor(currentTest: string, args: string[], outputChannel: vscode.OutputChannel) {
  //   this.currentTest = currentTest;
  //   this.args = args;
  //   this.outputChannel = outputChannel;
  // }

  constructor(currentTest: string, generation: number) {
    this.currentTest = currentTest;
    this.generation = generation;
  }

  async run(item: vscode.TestItem, options: vscode.TestRun) {
    const start = Date.now();
    let config = vscode.workspace.getConfiguration("phpunit");
    let args = [].concat(config.get<Array<string>>("args", []));

    if (this.currentTest) {
      args.push("--filter");
      args.push(this.currentTest);

      // this.phpUnit = new PhpUnitTestRunner(this.outputChannel, args);
      let phpUnit = new PhpUnitTestRunner(args);
      let testSuccess = phpUnit.run();
      const duration = Date.now() - start;

      if (testSuccess) {
        options.passed(item, duration);
      } else {
        const message = new vscode.TestMessage(`${item.label} Failed`);
        message.location = new vscode.Location(item.uri!, item.range!);
        options.failed(item, message, duration);
      }
    } else {
      const message = new vscode.TestMessage(`${item.label} not found`);
      options.failed(item, message);
    }
  }
}