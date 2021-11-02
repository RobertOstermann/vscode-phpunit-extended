import * as vscode from 'vscode';

const methodRegex = /\s*(public\s+){0,1}function\s+(\w+)\s*\(/gi;
const classRegex = /^\s*class\s+(\w*)\s*{?/gi;

// const testMethodRegex = /\s*(public\s+){0,1}function\s+(\w*test\w*)\s*\(/gi;

export const parsePHP = (text: string, events: {
  onTest(range: vscode.Range, name: string): void;
  onClass(range: vscode.Range, name: string): void;
}) => {
  // TODO: Add ability to make the pattern case sensitive
  const testMethodRegexString: string = vscode.workspace
    .getConfiguration("phpunit")
    .get("functionRegex");
  const testMethodRegex = new RegExp(testMethodRegexString, 'gi');

  const lines = text.split('\n');

  for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
    const line = lines[lineNumber];

    const validTestMethod = testMethodRegex.exec(line);
    const test = methodRegex.exec(line);
    if (validTestMethod && test) {
      const [, , name] = test;
      const range = new vscode.Range(
        new vscode.Position(lineNumber, 0),
        new vscode.Position(lineNumber, line.length)
      );
      events.onTest(range, name);
    }

    const heading = classRegex.exec(line);
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
