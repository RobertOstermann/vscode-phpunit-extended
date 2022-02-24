import * as vscode from "vscode";

import SharedConfiguration from "../../Helpers/configuration";

export default class TestExplorerConfiguration extends SharedConfiguration {
  /**
   * Initialize the configuration options that require a reload upon change.
   */
  static initialize(): void {
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (
        event.affectsConfiguration("phpunit.testExplorer.discoverAllTests") ||
        event.affectsConfiguration("phpunit.testExplorer.folderPattern") ||
        event.affectsConfiguration("phpunit.testExplorer.fileRegex") ||
        event.affectsConfiguration("phpunit.testExplorer.functionRegex") ||
        event.affectsConfiguration("phpunit.testExplorer.multilineFunctionRegex")
      ) {
        const action = "Reload";
        vscode.window
          .showInformationMessage(
            "Reload window for configuration change to take effect.",
            action
          )
          .then(selectedAction => {
            if (selectedAction === action) {
              vscode.commands.executeCommand("workbench.action.reloadWindow");
            }
          });
      }
    });
  }

  /**
   * @returns The test explorer arguments.
   */
  static args(): string[] {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("args", []);
  }

  /**
   * @returns Discover all tests within the workspace or only discover tests in opened files.
   */
  static discoverAllTests(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("discoverAllTests");
  }

  /**
   * @returns The file regex to determine the test files.
   */
  static fileRegex(): RegExp {
    const regexString: string = vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("fileRegex");

    return new RegExp(regexString, "gi");
  }

  /**
   * @returns The folder pattern to determine the files to watch.
   */
  static folderPattern(): string {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("folderPattern");
  }

  /**
   * @returns The function regex to determine the tests to run.
   */
  static functionRegex(): RegExp {
    const regexString: string = vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("functionRegex");
    if (vscode.workspace.getConfiguration("phpunit.testExplorer").get("multilineFunctionRegex")) {
      return new RegExp(regexString, "gis");
    }
    return new RegExp(regexString, "gi");
  }

  /**
   * @returns Determines if the function regex should evaluate multiple lines.
   */
  static multilineFunctionRegex(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("multilineFunctionRegex");
  }

  /**
   * @returns The number of tests to run in parallel.
   */
  static parallelTests(): number {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("parallelTests");
  }

  /**
   * @returns The situation to display the output channel.
   */
  static showOutput(): string {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("showOutput");
  }

  /**
   * @returns Determines if the test should be re-run in a terminal.
   */
  static showOutputInTerminal(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("showOutputInTerminal");
  }

  /**
   * @returns The time allotted for each test.
   */
  static timeout(): number {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("timeout");
  }

  /**
   * @returns Run all individual tests instead of using the test class to populate individual output.
   */
  static verboseTestExplorerOutput(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("verboseTestExplorerOutput");
  }
}
