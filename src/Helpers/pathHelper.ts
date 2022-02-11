import * as vscode from 'vscode';
import fs = require('fs');
import os = require('os');
import SharedConfiguration from './configuration';

export default class PathHelper {
  static findWorkingDirectory(currentPath: string = '') {
    return this.findNearestFileFullPath('phpunit.xml', currentPath)
      || this.findNearestFileFullPath('phpunit.xml.dist', currentPath);
  }

  static findNearestFileFullPath(fileRelativeName: string, currentPath: string = '') {
    let rootPath: string = null;
    currentPath = currentPath !== '' ? currentPath : this.normalizePath(vscode.window.activeTextEditor.document.uri.fsPath);
    for (let workspaceFolder of vscode.workspace.workspaceFolders) {
      const workspacePath = workspaceFolder.uri.fsPath;
      if (currentPath.includes(workspacePath)) {
        rootPath = workspacePath;
        break;
      }
    }

    currentPath = currentPath.replace(/[\\\/][^\\\/]*$/, '');

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
    return path
      .replace(/\\/g, '/') // Convert backslashes from Windows paths to forward slashes.
      .replace(/ /g, '\\ '); // Escape spaces.
  }
}