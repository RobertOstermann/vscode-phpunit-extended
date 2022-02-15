import * as vscode from "vscode";
import fs = require("fs");

export default class PathHelper {
  static findWorkingDirectory(currentPath = "") {
    return this.findNearestFileFullPath("phpunit.xml", currentPath)
      || this.findNearestFileFullPath("phpunit.xml.dist", currentPath);
  }

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

  static normalizePath(path: string): string {
    if (/^win/.test(process.platform)) {
      return path.replace(/\\/g, "/");
    }

    return path
      .replace(/\\/g, "/") // Convert backslashes from windows paths to forward slashes.
      .replace(/ /g, "\\ "); // Escape spaces.
  }
}