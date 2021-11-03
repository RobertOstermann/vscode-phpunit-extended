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
    const noAssertionsRegex = /.*not\sperform\sany\sassertions(\w*\s*)*/gi;

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
        return { success: false, message: message };
      }

      const noAssertionsMessage = noAssertionsRegex.exec(line);
      if (noAssertionsMessage) {
        const [message] = noAssertionsMessage;
        return { success: false, message: message };
      }
    }

    return { success: false, message: "Test Failed: Check Terminal Output" };
  }

  static parsePhpUnitOutputForClassTest(text: string) {
    const regex = /(Tests:.*Assertions.*Failures(\w*[^\\S\r\n\.]*)*)/gis;
    const result = regex.exec(text);

    if (result) {
      const [message] = result;
      return message;
    }

    return "Test Failed: Check Terminal Output";
  }

  static parsePhpUnitOutputForIndividualTest(text: string, name: string) {
    const regexString = `::${name}.*(Failed(\\w*[^\\S\r\n]*)*)`;
    const regex = new RegExp(regexString, 'gis');
    const result = regex.exec(text);

    if (result) {
      const [, message] = result;
      return message;
    }

    return "OK";
  }
}
