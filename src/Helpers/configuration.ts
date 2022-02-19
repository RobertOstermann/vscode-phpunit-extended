import * as vscode from "vscode";

export default class SharedConfiguration {
  /**
   * @returns The path to the `phpunit.xml` or `phpunit.xml.dist` file.
   */
  static configurationPath(): string {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get("configurationPath");
  }

  /**
   * @returns The path to the PHPUnit executable.
   */
  static execPath(): string {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get("execPath", "phpunit");
  }

  /**
   * @returns The environment variables to use when executing PHPUnit.
   */
  static envVars(): any {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get("envVars");
  }

  /**
   * @returns The path mappings for docker or ssh execution.
   */
  static path_mapping(): object {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get("pathMapping");
  }

  /**
   * @returns The arguments shared between the Test Explorer and the Command Line.
   */
  static sharedArgs(): string[] {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get<Array<string>>("args", []);
  }

  /**
   * @returns The path to the directory for the terminal's working directory to execute PHPUnit.
   */
  static workingDirectory(): string {
    return vscode.workspace
      .getConfiguration("phpunit")
      .get("workingDirectory");
  }

  /**
   * @returns Run tests in Docker.
   */
  static docker_enable(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit.docker")
      .get("enable");
  }

  /**
   * @returns The command to run test in Docker.
   */
  static docker_command(): string {
    return vscode.workspace
      .getConfiguration("phpunit.docker")
      .get("command");
  }

  /**
   * @returns Run tests over SSH.
   */
  static ssh_enable(): boolean {
    return vscode.workspace
      .getConfiguration("phpunit.ssh")
      .get("enable");
  }

  /**
   * @returns The command to run tests over SSH.
   */
  static ssh_command(): string {
    return vscode.workspace
      .getConfiguration("phpunit.ssh")
      .get("command");
  }
}
