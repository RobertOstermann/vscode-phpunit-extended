import * as vscode from "vscode";

import TestExplorerConfiguration from "./Helpers/configuration";
import { testData, TestFile } from "./testFile";

export default class TestDiscover {
  /**
   * Begins watching the files within the VSCode workspace.
   * 
   * @param controller - The controller for the test run.
   * @returns The filesystem watcher.
   */
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

  /**
   * Creates or updates the test item for the given document.
   * 
   * @param controller - The controller for the test run.
   * @param document - The test file.
   */
  static updateNodeForDocument(controller: vscode.TestController, document: vscode.TextDocument) {
    if (!document || document.uri.scheme !== "file" || !TestDiscover.validTestFilePath(document.uri.path)) {
      return;
    }

    const { file, data } = TestDiscover.getOrCreateFile(controller, document.uri);

    data.updateFromContents(controller, document.getText(), file);
  }

  /**
   * Retrieves the test items from the collection.
   * 
   * @param collection - The collection of test items.
   * @returns The test items.
   */
  static gatherTestItems(collection: vscode.TestItemCollection) {
    const items: vscode.TestItem[] = [];
    collection.forEach(item => items.push(item));
    return items;
  }

  /**
   * Retrieves the given test file and, if it exists, adds
   * the test item to the controller.
   * 
   * @param controller - The controller for the test run.
   * @param uri - The uri of the test file.
   * @returns The test file and associated test data.
   */
  static getOrCreateFile(controller: vscode.TestController, uri: vscode.Uri) {
    const existing = controller.items.get(uri.toString());
    if (existing) {
      return { file: existing, data: testData.get(existing) as TestFile };
    }

    const file = controller.createTestItem(uri.toString(), uri.path.split("/").pop()!, uri);
    file.canResolveChildren = true;
    controller.items.add(file);

    const data = new TestFile();
    testData.set(file, data);

    return { file, data };
  }

  /**
   * Determine if the test file is valid based
   * upon the user provided file regex setting.
   * 
   * @param path - The path of the file.
   * @returns The path compared against the file regex.
   */
  static validTestFilePath(path: string) {
    if (TestExplorerConfiguration.fileRegex().exec(path)) {
      return true;
    }

    return false;
  }

}
