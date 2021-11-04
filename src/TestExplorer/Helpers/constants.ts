/* eslint-disable no-useless-escape */
export class Constants {
  static readonly nearestFileSearchDepth: number = 100;

  static readonly timeoutMessage: string = "Test Failed: Timeout";

  static readonly individualTestPassedMessage: string = "OK";
  static readonly invalidTestMessage: string = "Test Failed: Check Terminal Output";

  static readonly classOutputRegex = /(Tests:.*Assertions.*Failures(\w*[^\\S\r\n\.])*)/is;

  static readonly phpUnitSuccessRegex = /OK\s+\(.*\)/i;
  static readonly phpUnitFailureRegex = /Failed\s+(\w*\s*)/i;
  static readonly phpUnitNoTestsRegex = /No\stests(\w*\s*)/i;
  static readonly phpUnitNoAssertionsRegex = /.*not\sperform\sany\sassertions(\w*\s*)/i;

  static readonly phpClassRegex = /^\s*class\s+(\w*)\s*{?/gi;
  static readonly phpMethodRegex = /\s*(public\s+)?function\s+(\w+)\s*\(/gi;
}
