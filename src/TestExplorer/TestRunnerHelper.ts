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

  static parsePhpUnitOutput(text: string) {
    const successRegex = /OK\s+\(.*\)/gi;
    const failureRegex = /Failed\s+(\w*\s*)*/gi;
    const noTestsRegex = /No\stests(\w*\s*)*/gi;

    const lines = text.split('\n');

    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      const line = lines[lineNumber];

      const successMessage = successRegex.exec(line);
      if (successMessage) {
        const [message] = successMessage;
        return { success: true, message: message };
      }

      const failureMessage = failureRegex.exec(line);
      if (failureMessage) {
        const [message] = failureMessage;
        return { success: false, message: message };
      }

      const noTestsMessage = noTestsRegex.exec(line);
      if (noTestsMessage) {
        const [message] = noTestsMessage;
        return { success: false, message: message}
      }
    }

    return { success: false, message: "ERROR" };
  }
}
