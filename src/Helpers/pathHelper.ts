import * as vscode from "vscode";
import fs = require("fs");

export default class PathHelper {
  /**
   * Finds the directory of `phpunit.xml` or `phpunit.xml.dist`.
   * 
   * @param currentPath - The path to the test file.
   * @returns The path to the working directory.
   */
  static findWorkingDirectory(currentPath = "") {
    return this.findNearestFileFullPath("phpunit.xml", currentPath)
      || this.findNearestFileFullPath("phpunit.xml.dist", currentPath);
  }

  /**
   * Searches up directories attempting to find
   * the path of the file given only the name.
   * 
   * @param fileRelativeName - The name of the file.
   * @param currentPath - The path to search.
   * @returns The path where the file resides.
   */
  static findNearestFileFullPath(fileRelativeName: string, currentPath = "") {
    let rootPath: string = null;
    currentPath = currentPath !== "" ? currentPath : this.normalizePath(vscode.window.activeTextEditor.document.uri.fsPath);
    for (const workspaceFolder of vscode.workspace.workspaceFolders) {
      const workspacePath = workspaceFolder.uri.fsPath;
      if (currentPath.includes(workspacePath)) {
        rootPath = workspacePath;
        break;
      }
    }

    // eslint-disable-next-line no-useless-escape
    currentPath = currentPath.replace(/[\\\/][^\\\/]*$/, "");

    const fileFullPath = `${currentPath}/${fileRelativeName}`;

    if (fs.existsSync(fileFullPath)) {
      return PathHelper.normalizePath(fileFullPath);
    } else if (currentPath != rootPath) {
      return this.findNearestFileFullPath(fileRelativeName, currentPath);
    } else {
      return null;
    }
  }

  /**
   * Normalizes the path to have forward slashes
   * instead of back slashes. Escapes spaces if not
   * on a Windows system.
   * 
   * @param path - The path to normalize.
   * @returns The path converted to a linux style path.
   */
  static normalizePath(path: string): string {
    if (/^win/.test(process.platform)) {
      return path.replace(/\\/g, "/"); // Convert backslashes to forward slashes.
    }

    return path
      .replace(/\\/g, "/") // Convert backslashes to forward slashes.
      .replace(/ /g, "\\ "); // Escape spaces.
  }
}
