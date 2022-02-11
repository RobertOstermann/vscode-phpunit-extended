import * as vscode from 'vscode';

export default class SharedConfiguration {
  static configurationPath(): string {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get("configurationPath");
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

  static sharedArgs(): string[] {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get<Array<string>>("args", []);
  }

  static workingDirectory(): string {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get("workingDirectory");
  }
}
