import * as vscode from "vscode";

export default class CommandLineConfiguration {
  /**
   * @returns The command line arguments.
   */
  static args(): string[] {
    return vscode.workspace
      .getConfiguration("phpunit.commandLine")
      .get<Array<string>>("args", []);
  }

  /**
   * @returns The excludedGroups to add to the arguments.
   */
  static excludedGroups(): string[] {
    return vscode.workspace
      .getConfiguration("phpunit.commandLine")
      .get<Array<string>>("excludedGroups", []);
  }

  /**
   * @returns The situation to display the output channel.
   */
  static showOutput(): string {
    return vscode.workspace
      .getConfiguration("phpunit.commandLine")
      .get("showOutput");
  }

  /**
   * @returns Determines if the test should be re-run in a terminal.
   */
  static showOutputInTerminal(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit.commandLine")
      .get("showOutputInTerminal");
  }

  /**
   * @returns The scripts to run after a test is completed.
   */
  static scriptsAfterTest(): any {
    return vscode.workspace
      .getConfiguration("phpunit.commandLine")
      .get("scriptsAfterTests");
  }
}
