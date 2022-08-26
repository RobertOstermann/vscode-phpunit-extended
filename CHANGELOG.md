# Change Log

All notable changes to this project will be documented in this file.

## [1.1.8] - 2022-08-24

- Add a different result for skipped tests.
- Add the theme color `phpunit.skippedTestBackground` to allow changing of the highlighted color for skipped tests.

## [1.1.7] - 2022-03-04

- Use more specific wording in the README Setup section - [issue #4](https://github.com/RobertOstermann/vscode-phpunit-extended/issues/4)

## [1.1.6] - 2022-03-04

- Add the option `highlightFailureLocation` to highlight the line causing a failure.
- Add the theme color `phpunit.failedTestBackground` to allow changing of the highlighted color.

## [1.1.5] - 2022-02-28

- Clear output when using TestExplorer.
- Show the message `OK` for passed tests when running a test class for Test Explorer.

## [1.1.4] - 2022-02-28

- Default the `functionRegex` to find tests the same way PHPUnit finds tests.
- Default the `multilineFunctionRegex` to `true`.

## [1.1.3] - 2022-02-25

- Fix bugs with Command Line tests.
- Handle errors better when running class tests in the test explorer.

## [1.1.2] - 2022-02-24

- Update `pathMapping` to `pathMappings`.

## [1.1.1] - 2022-02-24

- Bug fixes for `showOutputInTerminal`.

## [1.1.0] - 2022-02-24

- Bug fix for running on Windows.

## [1.0.9] - 2022-02-23

- Add `showOutputInTerminal` options to use a terminal instead of the output channel for showing output.

## [1.0.8] - 2022-02-20

- Fix Docker and SSH support for the command line tests.

## [1.0.7] - 2022-02-18

- Add limited Docker and SSH support.

## [1.0.6] - 2022-02-14

- Improve output of Test Explorer tests.
- Slight improvements to working with spaces within a path.

## [1.0.5] - 2022-02-11

- Bug fix.

## [1.0.4] - 2022-02-11

- Remove experimental configuration options.

## [1.0.3] - 2022-02-10

- Fix bug with `configurationPath` setting.

## [1.0.2] - 2022-02-10

- Add `configurationPath` configuration option.
- Add experimental option `useRelativePaths` configuration option.

## [1.0.1] - 2022-02-10

- Add `workingDirectory` configuration option. Defaults to `find` for backward compatability.
- Add `args` configuration option for shared arguments.

## [1.0.0] - 2022-01-28

- The names of settings have been changed! Please update setting in the settings.json file.
- The setting `phpunit.testExplorer.args` has been added to allow for configuration options.
- The setting `phpunit.testExplorer.showOutput` has been added to allow for easier viewing of the output for test explorer tests.

## [0.2.8] - 2022-01-24

- Activate the extension when the workspace contains a .php file

## [0.2.7] - 2022-01-21

- Add `multilineFunctionRegex` configuration option

## [0.2.6] - 2022-01-21

- Update the README

## [0.2.5] - 2021-12-01

- Update the build steps to improve performance

## [0.2.4] - 2021-12-01

- Fix problems with the last update

## [0.2.3] - 2021-12-01

- Update the name of the extension
- Fix problem with outfile

## [0.2.2] - 2021-11-04

- Allow for verbose test explorer output
- Fix problem with parallelTests configuration

## [0.2.1] - 2021-11-04

- Add configuration to run tests in parallel

## [0.2.0] - 2021-11-04

- Improve output messages for skipped and risky tests
- Fix problem of arguments affecting the test explorer
- Fix problem with finding the correct `.phpunit.xml` file when running tests in a workspace
- Fix invalid document error

## [0.1.9] - 2021-11-03

- Update timeout to use seconds instead of milliseconds.

## [0.1.8] - 2021-11-03

- Improve terminal output. Behind the scenes changes.

## [0.1.7] - 2021-11-03

- Add a timeout option to running the test from the test explorer.

## [0.1.6] - 2021-11-03

- Fix a typo in the README.

## [0.1.5] - 2021-11-03

- Update the README.

## [0.1.4] - 2021-11-03

- Allow discovery of all tests in a workspace.

## [0.1.3] - 2021-11-02

- Running a class runs tests much faster.

## [0.1.2] - 2021-11-01

- Bug Fixes.

## [0.1.1] - 2021-11-01

- Allow tests to run asynchronously.

## [0.1.0] - 2021-11-01

- Initial Release.
