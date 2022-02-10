import * as vscode from 'vscode';

export default class SharedConfiguration {
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

  static workingDirectory(): string {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get("workingDirectory");
  }
}
