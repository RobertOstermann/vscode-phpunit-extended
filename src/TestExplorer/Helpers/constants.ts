/* eslint-disable no-useless-escape */
export default class Constants {
  static readonly nearestFileSearchDepth: number = 100;

  static readonly timeoutMessage: string = "Test Failed: Timeout";

  static readonly individualTestPassedMessage: string = "OK";
  static readonly invalidTestMessage: string = "Test Failed: Check Terminal Output";

  static readonly classOutputRegex = /(Tests:.*Assertions.*(Incomplete|Risky|Skipped|Failures)(?:\w*[^\r\n\.])*)/is;

  static readonly phpUnitSuccessRegex = /OK\s+\(.*\)/i;
  static readonly phpUnitFailureRegex = /Failed\s+(?:[^\.])*/i;
  static readonly phpUnitNoTestsRegex = /No tests executed/i;
  static readonly phpUnitNoAssertionsRegex = /This test did not perform any assertions/i;

  static readonly phpClassRegex = /^\s*class\s+(\w*)\s*{?/gi;
  static readonly phpMethodRegex = /\s*(public\s+)?function\s+(\w+)\s*\(/gi;
}
