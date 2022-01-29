import * as vscode from 'vscode';
import TestExplorerConfiguration from './Helpers/configuration';
import { testData, TestFile } from './testFile';

export default class TestDiscover {
  static startWatchingWorkspace(controller: vscode.TestController) {
    if (!vscode.workspace.workspaceFolders) {
      return [];
    }

    return vscode.workspace.workspaceFolders.map(workspaceFolder => {
      const pattern = new vscode.RelativePattern(workspaceFolder, TestExplorerConfiguration.folderPattern());
      const watcher = vscode.workspace.createFileSystemWatcher(pattern);

      watcher.onDidCreate(uri => {
        if (TestDiscover.validTestFilePath(uri.path)) {
          TestDiscover.getOrCreateFile(controller, uri);
        }
      });
      watcher.onDidChange(uri => {
        if (TestDiscover.validTestFilePath(uri.path)) {
          const { file, data } = TestDiscover.getOrCreateFile(controller, uri);
          if (data.didResolve) {
            data.updateFromDisk(controller, file);
          }
        }
      });
      watcher.onDidDelete(uri => {
        controller.items.delete(uri.toString());
      });

      vscode.workspace.findFiles(pattern).then(files => {
        for (const file of files) {
          if (TestDiscover.validTestFilePath(file.path)) {
            TestDiscover.getOrCreateFile(controller, file);
          }
        }
      });

      return watcher;
    });
  }

  static updateNodeForDocument(controller: vscode.TestController, document: vscode.TextDocument) {
    if (!document || document.uri.scheme !== 'file' || !TestDiscover.validTestFilePath(document.uri.path)) {
      return;
    }

    const { file, data } = TestDiscover.getOrCreateFile(controller, document.uri);

    data.updateFromContents(controller, document.getText(), file);
  }

  static gatherTestItems(collection: vscode.TestItemCollection) {
    const items: vscode.TestItem[] = [];
    collection.forEach(item => items.push(item));
    return items;
  }

  static getOrCreateFile(controller: vscode.TestController, uri: vscode.Uri) {
    const existing = controller.items.get(uri.toString());
    if (existing) {
      return { file: existing, data: testData.get(existing) as TestFile };
    }

    const file = controller.createTestItem(uri.toString(), uri.path.split('/').pop()!, uri);
    file.canResolveChildren = true;
    controller.items.add(file);

    const data = new TestFile();
    testData.set(file, data);

    return { file, data };
  }

  static validTestFilePath(path: string) {
    if (TestExplorerConfiguration.fileRegex().exec(path)) {
      return true;
    }

    return false;
  }

}