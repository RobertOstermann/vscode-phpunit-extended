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

  public static parallelTests(): number {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get("parallelTests");
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
    if (vscode.workspace.getConfiguration("phpunit").get("multilineFunctionRegex")) {
      return new RegExp(regexString, "gis");
    }
    return new RegExp(regexString, "gi");
  }

  public static multilineFunctionRegex(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get("multilineFunctionRegex");
  }

  public static verboseTestExplorerOutput(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get("verboseTestExplorerOutput");
  }
}
