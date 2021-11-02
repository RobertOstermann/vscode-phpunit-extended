import * as vscode from 'vscode';
import cp = require('child_process');
import fs = require('fs');

export default class PhpUnitTestRunner {
  private args: string[];
  private putFsPathIntoArgs: boolean;
  // private outputChannel: vscode.OutputChannel;
  private currentTest: cp.ChildProcess;

  // constructor(outputChannel: vscode.OutputChannel, args: string[], putFsPathIntoArgs: boolean = true) {
  //   this.outputChannel = outputChannel;
  //   this.args = args;
  //   this.putFsPathIntoArgs = putFsPathIntoArgs;
  // }

  constructor(args: string[], putFsPathIntoArgs: boolean = true) {
    this.args = args;
    this.putFsPathIntoArgs = putFsPathIntoArgs;
  }

  public run(): boolean {
    let config = vscode.workspace.getConfiguration("phpunit");
    let phpunitPath = config.get<string>("execPath", "phpunit");

    if (phpunitPath == "") {
      return this.execThroughComposer();
    } else {
      this.execPhpUnit(phpunitPath);
    }

    return true;
  }

  private execThroughComposer(): boolean {
    let phpUnitComposerBinFile = this.findNearestFileFullPath('vendor/bin/phpunit');

    if (phpUnitComposerBinFile != null) {
      return this.execPhpUnit(phpUnitComposerBinFile);
    } else {
      vscode.window.showErrorMessage('Couldn\'t find a vendor/bin/phpunit file.');
      return false;
    }
  }

  public execPhpUnit(phpunitPath: string, workingDirectory = null): boolean {
    let testSuccess = true;
    // this.outputChannel.clear();

    workingDirectory = workingDirectory == null ? this.findWorkingDirectory() : workingDirectory;
    let showOutput = vscode.workspace.getConfiguration('phpunit').showOutput;
    if (showOutput != 'always') {
      // this.outputChannel.hide();
    }

    if (workingDirectory == null) {
      return;
    }

    if (this.putFsPathIntoArgs) {
      this.args.push(vscode.window.activeTextEditor.document.uri.fsPath);
    }

    let command = '';

    if (/^win/.test(process.platform)) {
      command = 'cmd';
      this.args.unshift(phpunitPath);
      this.args.unshift('/c');
    } else {
      command = phpunitPath;
    }

    let phpunitProcess = cp.spawn(
      command,
      this.args,
      { cwd: workingDirectory.replace(/([\\\/][^\\\/]*\.[^\\\/]+)$/, ''), env: vscode.workspace.getConfiguration('phpunit').envVars }
    );

    this.currentTest = phpunitProcess;

    // this.outputChannel.appendLine(phpunitPath + ' ' + this.args.join(' '));

    phpunitProcess.stderr.on("data", (buffer: Buffer) => {
      // this.outputChannel.append(buffer.toString());
    });

    phpunitProcess.stdout.on("data", (buffer: Buffer) => {
      // this.outputChannel.append(buffer.toString());
      if (buffer.toString().includes("FAILURES")) {
        testSuccess = false;
      }
    });

    phpunitProcess.on("close", (code) => {
      if (showOutput == 'ok' && code == 0) {
        // this.outputChannel.show();
      } else if (showOutput == 'error' && code == 1) {
        // this.outputChannel.show();
      }
    });

    phpunitProcess.on("exit", (code, signal) => {
      if (signal != null) {
        // this.outputChannel.append('Cancelled');
      }
    });

    if (showOutput == 'always') {
      // this.outputChannel.show();
    }

    return testSuccess;
  }

  private findNearestFileFullPath(fileRelativeName: string, currentPath = '') {
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

  private findWorkingDirectory() {
    let workingDirectory = this.findNearestFileFullPath('phpunit.xml')
      || this.findNearestFileFullPath('phpunit.xml.dist');

    if (workingDirectory == null) {
      vscode.window.showErrorMessage('Couldn\'t find a working directory.');
    }

    return workingDirectory;
  }

  public cancelCurrentTest() {
    if (this.currentTest) {
      this.currentTest.kill();
      this.currentTest = null;
    } else {
      vscode.window.showInformationMessage("There are no tests running.");
    }
  }
}
