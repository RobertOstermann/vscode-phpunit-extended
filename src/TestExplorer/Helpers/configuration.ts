import * as vscode from 'vscode';

export class Configuration {
  public static discoverAllTests(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get("discoverAllTests");
  }

  public static fileRegex(): RegExp {
    const regexString: string = vscode.workspace
      .getConfiguration("phpunit")
      .get("fileRegex");

    return new RegExp(regexString, 'gi');
  }

  public static folderPattern(): string {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get("folderPattern");
  }

  public static functionRegex(): RegExp {
    const regexString: string = vscode.workspace
      .getConfiguration("phpunit")
      .get("functionRegex");
    return new RegExp(regexString, 'gi');
  }
}