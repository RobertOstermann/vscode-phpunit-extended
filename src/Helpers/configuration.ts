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

  static experimental_useRelativePaths(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit.experimental")
      .get("useRelativePaths");
  }

  static experimental_docker_enable(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit.experimental.docker")
      .get("enable");
  }

  static experimental_docker_command(): string {
    return vscode.workspace
      .getConfiguration("phpunit.experimental.docker")
      .get("command");
  }

  static experimental_docker_paths(): object {
    return vscode.workspace
      .getConfiguration("phpunit.experimental.docker")
      .get("paths");
  }

  static experimental_ssh_enable(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit.experimental.ssh")
      .get("enable");
  }

  static experimental_ssh_args(): string[] {
    return vscode.workspace
      .getConfiguration("phpunit.experimental.ssh")
      .get("args");
  }

  static experimental_ssh_user(): string {
    return vscode.workspace
      .getConfiguration("phpunit.experimental.ssh")
      .get("user");
  }

  static experimental_ssh_host(): string {
    return vscode.workspace
      .getConfiguration("phpunit.experimental.ssh")
      .get("host");
  }

  static experimental_ssh_paths(): object {
    return vscode.workspace
      .getConfiguration("phpunit.experimental.ssh")
      .get("paths");
  }

  static experimental_ssh_execPath(): string {
    return vscode.workspace
      .getConfiguration("phpunit.experimental.ssh")
      .get("execPath");
  }
}
