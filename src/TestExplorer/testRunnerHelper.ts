import * as vscode from 'vscode';
import fs = require('fs');
import { Constants } from './Helpers/constants';

export default class TestRunnerHelper {
  static findWorkingDirectory() {
    return this.findNearestFileFullPath('phpunit.xml')
      || this.findNearestFileFullPath('phpunit.xml.dist');
  }

  static findNearestFileFullPath(fileRelativeName: string, currentPath = '') {
    const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

    if (currentPath == '') {
      const filePath = vscode.window.activeTextEditor.document.uri.fsPath;
      currentPath = filePath.replace(/([\\\/][^\\\/]*\.[^\\\/]+)$/, '');
    } else {
      currentPath = currentPath.replace(/[\\\/][^\\\/]*$/, '');
    }

    const fileFullPath = `${currentPath}/${fileRelativeName}`;

    if (fs.existsSync(fileFullPath)) {
      return fileFullPath;
    } else if (currentPath != rootPath) {
      return this.findNearestFileFullPath(fileRelativeName, currentPath);
    } else {
      return null;
    }
  }

  static parsePhpUnitOutput(text: string) {
    const lines = text.split('\n');

    for (let line of lines) {
      const successMessage = Constants.phpUnitSuccessRegex.exec(line);
      if (successMessage) {
        const [message] = successMessage;
        return { success: true, message: message };
      }

      const failureMessage = Constants.phpUnitFailureRegex.exec(line);
      if (failureMessage) {
        const [message] = failureMessage;
        return { success: false, message: message };
      }

      const noTestsMessage = Constants.phpUnitNoTestsRegex.exec(line);
      if (noTestsMessage) {
        const [message] = noTestsMessage;
        return { success: false, message: message };
      }

      const noAssertionsMessage = Constants.phpUnitNoAssertionsRegex.exec(line);
      if (noAssertionsMessage) {
        const [message] = noAssertionsMessage;
        return { success: false, message: message };
      }
    }

    if (text === Constants.timeoutMessage) {
      return { success: false, message: Constants.timeoutMessage };
    }

    return { success: false, message: Constants.invalidTestMessage };
  }

  static parsePhpUnitOutputForClassTest(text: string) {
    const result = Constants.classOutputRegex.exec(text);

    if (result) {
      const [message] = result;
      return { errorStatus: false, errorOutput: message };
    }

    return { errorStatus: true, output: Constants.timeoutMessage };
  }

  static parsePhpUnitOutputForIndividualTest(text: string, name: string) {
    const regexString = `::${name}.*(Failed(\\w*[^\\S\r\n]*)*)`;
    const regex = new RegExp(regexString, 'gis');
    const result = regex.exec(text);

    if (result) {
      const [, message] = result;
      return message;
    }

    return Constants.individualTestPassedMessage;
  }

  static promiseWithTimeout(promise, timeout: number, timeoutMessage: string) {
    if (!timeout) {
      return promise;
    }

    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve(timeoutMessage);
      }, timeout);
    });

    return Promise.race([promise, timeoutPromise]);
  }
}
