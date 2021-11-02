import { TextDecoder } from 'util';
import * as vscode from 'vscode';
import TestCase from './TestCase';
import { parsePHP } from './parser';

const textDecoder = new TextDecoder('utf-8');

export type phpTestData = TestFile | TestHeading | TestCase;

export const testData = new WeakMap<vscode.TestItem, phpTestData>();

let generationCounter = 0;

export const getContentFromFilesystem = async (uri: vscode.Uri) => {
  try {
    const rawContent = await vscode.workspace.fs.readFile(uri);
    return textDecoder.decode(rawContent);
  } catch (e) {
    console.warn(`Error providing tests for ${uri.fsPath}`, e);
    return '';
  }
};

export class TestFile {
  public didResolve = false;

  public async updateFromDisk(controller: vscode.TestController, item: vscode.TestItem) {
    try {
      const content = await getContentFromFilesystem(item.uri!);
      item.error = undefined;
      this.updateFromContents(controller, content, item);
    } catch (e) {
      item.error = e.stack;
    }
  }

  /**
   * Parses the tests from the input text, and updates the tests contained
   * by this file to be those from the text,
   */
  public updateFromContents(controller: vscode.TestController, content: string, item: vscode.TestItem) {
    const ancestors = [{ item, children: [] as vscode.TestItem[] }];
    const thisGeneration = generationCounter++;
    this.didResolve = true;

    let config = vscode.workspace.getConfiguration("phpunit");
    let args = [].concat(config.get<Array<string>>("args", []));

    const ascend = (depth: number) => {
      while (ancestors.length > depth) {
        const finished = ancestors.pop()!;
        finished.item.children.replace(finished.children);
      }
    };

    parsePHP(content, {
      onTest: (range: vscode.Range, name: string) => {
        const parent = ancestors[ancestors.length - 1];
        const data = new TestCase(name, args);
        const id = `${item.uri}/${data.getLabel()}`;


        const tcase = controller.createTestItem(id, data.getLabel(), item.uri);
        testData.set(tcase, data);
        tcase.range = range;
        parent.children.push(tcase);
      },

      onHeading: (range: vscode.Range, name: string) => {
        ascend(0);
        const parent = ancestors[ancestors.length - 1];
        const id = `${item.uri}/${name}`;

        const thead = controller.createTestItem(id, name, item.uri);
        thead.range = range;
        testData.set(thead, new TestHeading(thisGeneration));
        parent.children.push(thead);
        ancestors.push({ item: thead, children: [] });
      },
    });

    ascend(0); // finish and assign children for all remaining items
  }
}

export class TestHeading {
  constructor(public generation: number) { }
}

