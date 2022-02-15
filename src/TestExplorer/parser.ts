import * as vscode from "vscode";

import TestExplorerConfiguration from "./Helpers/configuration";
import Constants from "./Helpers/constants";

/**
 * Parses the text of a test file and determines the classes
 * and individual tests within that file. 
 * 
 * @param text - The text of the test file.
 * @param events - The functions to run when a test or class is found.
 */
export const parsePHP = (text: string, events: {
  onTest(range: vscode.Range, name: string): void;
  onClass(range: vscode.Range, name: string): void;
}) => {
  const lines = text.split("\n");
  let previousFunctionLine = 0;

  for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
    const line = lines[lineNumber];
    let functionRegexLines = line;

    if (TestExplorerConfiguration.multilineFunctionRegex()) {
      functionRegexLines = lines.slice(previousFunctionLine, lineNumber + 1).join("\n");
    }

    const validTestMethod = TestExplorerConfiguration.functionRegex().exec(functionRegexLines);
    const test = Constants.phpMethodRegex.exec(line);
    if (validTestMethod && test) {
      previousFunctionLine = lineNumber + 1;
      const [, , name] = test;
      const range = new vscode.Range(
        new vscode.Position(lineNumber, 0),
        new vscode.Position(lineNumber, line.length)
      );
      events.onTest(range, name);
    }

    const heading = Constants.phpClassRegex.exec(line);
    if (heading) {
      const [, name] = heading;
      const range = new vscode.Range(
        new vscode.Position(lineNumber, 0),
        new vscode.Position(lineNumber, line.length)
      );
      events.onClass(range, name);
    }
  }
};
