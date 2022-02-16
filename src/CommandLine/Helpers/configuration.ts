import * as vscode from "vscode";

import SharedConfiguration from "../../Helpers/configuration";

export default class CommandLineConfiguration extends SharedConfiguration {
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
   * @returns The scripts to run after a test is completed.
   */
  static scriptsAfterTest(): any {
    return vscode.workspace
      .getConfiguration("phpunit.commandLine")
      .get("scriptsAfterTests");
  }
}
