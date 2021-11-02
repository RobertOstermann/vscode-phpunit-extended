import * as vscode from 'vscode';
import cp = require('child_process');
import fs = require('fs');

export default class TestRunnerHelper {
  static findWorkingDirectory() {
    let workingDirectory = this.findNearestFileFullPath('phpunit.xml')
      || this.findNearestFileFullPath('phpunit.xml.dist');

    return workingDirectory;
  }

  static findNearestFileFullPath(fileRelativeName: string, currentPath = '') {
    let rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

    if (currentPath == '') {
      let filePath = vscode.window.activeTextEditor.document.uri.fsPath;
      currentPath = filePath.replace(/([\\\/][^\\\/]*\.[^\\\/]+)$/, '');
    } else {
      currentPath = currentPath.replace(/[\\\/][^\\\/]*$/, '');
    }

    let fileFullPath = `${currentPath}/${fileRelativeName}`;

    if (fs.existsSync(fileFullPath)) {
      return fileFullPath;
    } else if (currentPath != rootPath) {
      return this.findNearestFileFullPath(fileRelativeName, currentPath);
    } else {
      return null;
    }
  }

  private static readonly successRegex = /class\s+(\w*)\s*{?/gi;
  private static readonly failureRegex = /class\s+(\w*)\s*{?/gi;

  static parsePhpUnitOutput(text: string) {
    const lines = text.split('\n');

    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      const line = lines[lineNumber];

      const success = this.successRegex.exec(line);
      if (success) {
        return success;
      }

      const failure = this.failureRegex.exec(line);
      if (failure) {
        return failure;
      }
    }
  }
}
