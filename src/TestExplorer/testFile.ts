import { TextDecoder } from "util";
import * as vscode from "vscode";

import { parsePHP } from "./parser";
import TestCase from "./testCase";
import TestClass from "./testClass";

export type phpTestData = TestFile | TestClass | TestCase;
export const testData = new WeakMap<vscode.TestItem, phpTestData>();
const textDecoder = new TextDecoder("utf-8");

let generationCounter = 0;

export const getContentFromFilesystem = async (uri: vscode.Uri) => {
  try {
    const rawContent = await vscode.workspace.fs.readFile(uri);
    return textDecoder.decode(rawContent);
  } catch (error) {
    console.warn(`Error providing tests for ${uri.fsPath}`, error);
    return "";
  }
};

export class TestFile {
  public didResolve = false;

  public async updateFromDisk(controller: vscode.TestController, item: vscode.TestItem) {
    try {
      const content = await getContentFromFilesystem(item.uri!);
      item.error = undefined;
      this.updateFromContents(controller, content, item);
    } catch (error) {
      item.error = error.stack;
    }
  }

  public updateFromContents(controller: vscode.TestController, content: string, item: vscode.TestItem) {
    const ancestors = [{ item, children: [] as vscode.TestItem[] }];
    const thisGeneration = generationCounter++;
    this.didResolve = true;

    const ascend = (depth: number) => {
      while (ancestors.length > depth) {
        const finished = ancestors.pop();
        finished?.item?.children?.replace(finished.children);
      }
    };

    parsePHP(content, {
      onTest: (range: vscode.Range, name: string) => {
        const parent = ancestors[ancestors.length - 1];
        const data = new TestCase(name, item.uri, thisGeneration);
        const id = `${item.uri}/${name}`;

        const testCase = controller.createTestItem(id, name, item.uri);
        testData.set(testCase, data);
        testCase.range = range;
        parent.children.push(testCase);
      },

      onClass: (range: vscode.Range, name: string) => {
        ascend(1);
        const parent = ancestors[ancestors.length - 1];
        const data = new TestClass(name, item.uri, thisGeneration);
        const id = `${item.uri}/${name}`;

        const testClass = controller.createTestItem(id, name, item.uri);
        testData.set(testClass, data);
        testClass.range = range;
        parent.children.push(testClass);
        ancestors.push({ item: testClass, children: [] });
      },
    });

    ascend(0);
  }
}
