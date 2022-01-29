import * as vscode from 'vscode';

export default class TestExplorerConfiguration {
  static initialize(): void {
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (
        event.affectsConfiguration("phpunit.testExplorer.discoverAllTests") ||
        event.affectsConfiguration("phpunit.testExplorer.folderPattern") ||
        event.affectsConfiguration("phpunit.testExplorer.fileRegex") ||
        event.affectsConfiguration("phpunit.testExplorer.functionRegex") ||
        event.affectsConfiguration("phpunit.testExplorer.multilineFunctionRegex")
      ) {
        const action = 'Reload';
        vscode.window
          .showInformationMessage(
            `Reload window for configuration change to take effect.`,
            action
          )
          .then(selectedAction => {
            if (selectedAction === action) {
              vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
          });
      }
    });
  }

  static execPath(): string {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get("execPath", "phpunit");
  }

  static envVars(): any {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get("envVars");
  }

  static args(): string[] {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("args", []);;
  }

  static discoverAllTests(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("discoverAllTests");
  }

  static fileRegex(): RegExp {
    const regexString: string = vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("fileRegex");

    return new RegExp(regexString, 'gi');
  }

  static folderPattern(): string {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("folderPattern");
  }

  static functionRegex(): RegExp {
    const regexString: string = vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("functionRegex");
    if (vscode.workspace.getConfiguration("phpunit.testExplorer").get("multilineFunctionRegex")) {
      return new RegExp(regexString, "gis");
    }
    return new RegExp(regexString, "gi");
  }

  static multilineFunctionRegex(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("multilineFunctionRegex");
  }

  static parallelTests(): number {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("parallelTests");
  }

  static showOutput(): string {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("showOutput");
  }

  static timeout(): number {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("timeout");
  }

  static verboseTestExplorerOutput(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit.testExplorer")
      .get("verboseTestExplorerOutput");
  }
}
