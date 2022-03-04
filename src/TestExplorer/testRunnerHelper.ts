import { MessageChannel } from "worker_threads";

import PathHelper from "../Helpers/pathHelper";
import Constants from "./Helpers/constants";
import TestResult from "./Helpers/testResult";

export default class TestRunnerHelper {
  /**
   * Parse the full output of the PHPUnit test run and
   * use a variety of regexes to determine the success status
   * and the shortened message to display inline next to the test.
   * 
   * @param text - The full output of the PHPUnit test run.
   * @param fsPath - The path to the test file.
   * @returns The success status and a shortened message for the test.
   */
  static parsePhpUnitOutput(text: string, fsPath: string = undefined): TestResult {
    const lines = text.split("\n");
    const result: TestResult = {};

    for (const line of lines) {
      if (!result?.message) {
        const successMessage = Constants.phpUnitSuccessRegex.exec(line);
        if (successMessage) {
          const [message] = successMessage;
          result.success = true;
          result.message = message;
        }

        const failureMessage = Constants.phpUnitFailureRegex.exec(line);
        if (failureMessage) {
          const [message] = failureMessage;
          result.success = false;
          result.message = message;
        }

        const noTestsMessage = Constants.phpUnitNoTestsRegex.exec(line);
        if (noTestsMessage) {
          const [message] = noTestsMessage;
          result.success = false;
          result.message = message;
        }

        const noAssertionsMessage = Constants.phpUnitNoAssertionsRegex.exec(line);
        if (noAssertionsMessage) {
          const [message] = noAssertionsMessage;
          result.success = false;
          result.message = message;
        }
      } else if (!result?.line) {
        const pathWithLine = PathHelper.remapLocalPath(line);
        const path = pathWithLine.replace(/:\d+/, "");
        const localPath = PathHelper.remapLocalPath(fsPath);
        if (localPath?.toLowerCase() == path?.toLowerCase()) {
          result.line = parseInt(pathWithLine.substring(path.length + 1));
        }
      }
    }

    if (result?.message) {
      return result;
    }

    result.success = false;
    result.message = text === Constants.timeoutMessage ? Constants.timeoutMessage : Constants.invalidTestMessage;
    return result;
  }

  /**
   * Parse the full output of the PHPUnit test run (for a test class) and
   * use the {@link Constants.classOutputRegex} to determine
   * the success status and the shortened message to display inline next to the test.
   * 
   * @param text - The full output of the PHPUnit test run.
   * @returns The success status and a shortened message for the test class.
   */
  static parsePhpUnitOutputForClassTest(text: string) {
    const result = Constants.classOutputRegex.exec(text);

    if (result) {
      const [message] = result;
      return { errorStatus: false, errorOutput: message };
    }

    return { errorStatus: true, output: Constants.timeoutMessage };
  }

  /**
   * Parse the full output of the PHPUnit test run (for a test class) and
   * determine the success status of the test and a shortened message
   * for the individual test to display. Note: Currently the passing output message,
   * {@link Constants.individualTestPassedMessage}, is not displayed.
   * 
   * @param text - The full output of the PHPUnit test run.
   * @param name - The function name of the given test.
   * @param fsPath - The path to the test file.
   * @returns The success status and a shortened message for the individual test.
   */
  static parsePhpUnitOutputForIndividualTest(text: string, name: string, fsPath: string) {
    const regexString = `(${name}(?:[^\\)])*.*)(?:Tests:.*Assertions.*(?:Incomplete|Risky|Skipped|Failures)(?:\\w*[^\\r\\n\\.])*)`;
    const regex = new RegExp(regexString, "is");
    const regexResult = regex.exec(text);

    if (regexResult) {
      const [, output] = regexResult;
      const result = this.parsePhpUnitOutput(output, fsPath);

      if (result?.success) {
        result.message = Constants.individualTestPassedMessage;
      }

      return result;
    }

    const result: TestResult = {};
    result.message = Constants.individualTestPassedMessage;
    result.success = true;
    return result;
  }

  /**
   * Run any promise against a given time (seconds) and cancel the promise
   * if the timeout is exceeded.
   * 
   * @param promise - The promise to run.
   * @param timeout - The time (seconds) before the promise is cancelled.
   * @param timeoutMessage - The message to display if the timeout is met before the promise is complete. 
   * @returns The promise, if finished before the timeout, or a timeout message.
   */
  static promiseWithTimeout(promise: any, timeout: number, timeoutMessage: string) {
    if (!timeout) {
      return promise;
    }

    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve(timeoutMessage);
      }, timeout * 1000);
    });

    return Promise.race([promise, timeoutPromise]);
  }
}
