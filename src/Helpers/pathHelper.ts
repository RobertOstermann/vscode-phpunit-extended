import * as vscode from "vscode";
import fs = require("fs");
import os = require("os");
import SharedConfiguration from "./configuration";

export default class PathHelper {
  /**
   * Finds the directory of `phpunit.xml` or `phpunit.xml.dist`.
   * 
   * @param currentPath - The path to the test file.
   * @returns The path to the working directory.
   */
  static findWorkingDirectory(currentPath = "") {
    currentPath = this.remapLocalPath(currentPath);

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
    currentPath = currentPath !== "" ? currentPath : this.remapLocalPath(vscode.window.activeTextEditor.document.uri.fsPath);
    for (const workspaceFolder of vscode.workspace.workspaceFolders) {
      const workspacePath = this.remapLocalPath(workspaceFolder.uri.fsPath);
      if (currentPath.includes(workspacePath)) {
        rootPath = workspacePath;
        break;
      }
    }

    if (rootPath === null) return null;

    // eslint-disable-next-line no-useless-escape
    currentPath = currentPath.replace(/[\\\/][^\\\/]*$/, "");

    const fileFullPath = `${currentPath}/${fileRelativeName}`;

    if (fs.existsSync(fileFullPath)) {
      return fileFullPath;
    } else if (currentPath != rootPath) {
      return this.findNearestFileFullPath(fileRelativeName, currentPath);
    } else {
      return null;
    }
  }

  /**
   * Remaps local paths that match the path mappings
   * to have the new path mapping.
   * 
   * @param actualPath - The current path.
   * @returns The path according to the path mappings.
   */
  static remapLocalPath(actualPath: string): string {
    actualPath = this.normalizePath(actualPath);

    if (SharedConfiguration.docker_enable() || SharedConfiguration.ssh_enable()) {
      for (const [localPath, remotePath] of Object.entries(this.getPaths())) {
        const expandedLocalPath = localPath.replace(/^~/, os.homedir());
        if (actualPath.startsWith(expandedLocalPath)) {
          return actualPath.replace(expandedLocalPath, remotePath);
        }
      }
    }

    return actualPath;
  }

  /**
   * Normalizes the path to have forward slashes
   * instead of back slashes. Escapes spaces if not
   * on a Windows system.
   * 
   * @param path - The path to normalize.
   * @returns The path converted to a linux style path.
   */
  private static normalizePath(path: string): string {
    if (/^win/.test(process.platform)) {
      return path.replace(/\\/g, "/"); // Convert backslashes to forward slashes.
    }

    return path
      .replace(/\\/g, "/") // Convert backslashes to forward slashes.
      .replace(/ /g, "\\ "); // Escape spaces.
  }

  private static getPaths() {
    if (SharedConfiguration.docker_enable) {
      if (!SharedConfiguration.ssh_enable() || Object.keys(SharedConfiguration.docker_paths()).length !== 0)
        return SharedConfiguration.docker_paths();
    }

    return SharedConfiguration.ssh_paths();
  }
}
