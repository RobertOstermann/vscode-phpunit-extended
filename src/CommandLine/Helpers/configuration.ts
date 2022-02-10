import * as vscode from 'vscode';
import SharedConfiguration from '../../Helpers/configuration';

export default class CommandLineConfiguration extends SharedConfiguration {
  static args(): string[] {
    return vscode.workspace
      .getConfiguration("phpunit.commandLine")
      .get<Array<string>>("args", []);
  }

  static discoverAllTests(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit.commandLine")
      .get("discoverAllTests");
  }

  static excludedGroups(): string[] {
    return vscode.workspace
      .getConfiguration("phpunit.commandLine")
      .get<Array<string>>("excludedGroups", []);
  }

  static showOutput(): string {
    return vscode.workspace
      .getConfiguration("phpunit.commandLine")
      .get("showOutput");
  }

  static scriptsAfterTest(): any {
    return vscode.workspace
      .getConfiguration("phpunit.commandLine")
      .get("scriptsAfterTests");
  }
}
