import * as vscode from 'vscode';

import { Configuration } from './Helpers/configuration';
import { Constants } from './Helpers/constants';

export const parsePHP = (text: string, events: {
  onTest(range: vscode.Range, name: string): void;
  onClass(range: vscode.Range, name: string): void;
}) => {
  const lines = text.split('\n');

  for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
    const line = lines[lineNumber];

    const validTestMethod = Configuration.functionRegex().exec(line);
    const test = Constants.phpMethodRegex.exec(line);
    if (validTestMethod && test) {
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
