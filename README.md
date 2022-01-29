# PHPUnit Extended With Test Explorer for VSCode

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=RobertOstermann.phpunit-extended-test-explorer"><img src="https://vsmarketplacebadge.apphb.com/version-short/RobertOstermann.phpunit-extended-test-explorer.svg" alt="VS Marketplace Version"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=RobertOstermann.phpunit-extended-test-explorer"><img src="https://vsmarketplacebadge.apphb.com/installs-short/RobertOstermann.phpunit-extended-test-explorer.svg" alt="VS Marketplace Installs"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=RobertOstermann.phpunit-extended-test-explorer"><img src="https://vsmarketplacebadge.apphb.com/rating-short/RobertOstermann.phpunit-extended-test-explorer.svg" alt="VS Marketplace Rating"></a>
</p>

## Setup

- Install [phpunit](https://phpunit.de/) or have phpunit installed through composer.
- Set the config values:

```JSON
{
    "phpunit.execPath": "path/to/phpunit", // If this value is set to '' it will try to use the composer phpunit installation.
    "phpunit.envVars": {
        // Here you can define the environment variables to be set before executing phpunit
        "XDEBUG_CONFIG": "idekey=VSCODE"
    },
    "phpunit.commandLine.args": [
        "--testdox"
    ],
    "phpunit.commandLine.excludedGroups": [
        // Groups to be excluded when running the TestSuiteWithExclusions command
    ],
    "phpunit.commandLine.scriptsAfterTests": {
        "ok": [
            {
            "command": "some-command-with-args",
            "args": ["-status=ok"]
            },
            "another-command-without-args"
        ],
        "error": []
    },
    "phpunit.commandLine.showOutput": "always",
    "phpunit.testExplorer.args": [
        "--configuration", "./phpunit.xml.dist"
    ],
    "phpunit.testExplorer.fileRegex": ".*(test|tests)\\w*\\.php",
    "phpunit.testExplorer.functionRegex": "\\s*(public\\s+){0,1}function\\s+(\\w*test\\w*)\\s*\\(",
    "phpunit.testExplorer.multilineFunctionRegex": false,
    "phpunit.testExplorer.folderPattern": "**/{test,tests,Test,Tests}/**/*.php",
    "phpunit.testExplorer.discoverAllTests": true
}
```

## Settings

| Name                                             | Description                                                                                                                               | Default                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `phpunit.envVars`                                | Set environment variables before running phpunit                                                                                          | `{}`                                                     |
| `phpunit.execPath`                               | Path to phpunit executable (if empty it tries to use composer installation).                                                              | `""`                                                     |
| `phpunit.commandLine.args`                       | Any phpunit args (phpunit --help)                                                                                                         | `[]`                                                     |
| `phpunit.commandLine.excludedGroups`             | Groups to be excluded from the tests                                                                                                      | `[]`                                                     |
| `phpunit.commandLine.scriptsAfterTests`          | Scripts to execute after the tests run                                                                                                    | `{ "ok": [], "error": []}`                               |
| `phpunit.commandLine.showOutput`                 | Show the output console after the tests run (always, error, ok).                                                                          | `always`                                                 |
| `phpunit.testExplorer.args`                      | This is useful for setting the configuration. Warning: some arguments, such as --testdox, will not allow the test explorer tests to pass. | `[]`                                                     |
| `phpunit.testExplorer.discoverAllTests`          | Determines whether to discover all tests immediately or discover them individually once opened in the editor.                             | `true`                                                   |
| `phpunit.testExplorer.fileRegex`                 | The regular expression used to determine test files.                                                                                      | `".*(test\|tests)\\w\*\\.php"`                           |
| `phpunit.testExplorer.folderPattern`             | A file glob pattern used to determine the folders to watch. Only used when discoverAllTests is set to true.                               | `"**/{test,tests,Test,Tests}/**/*.php"`                  |
| `phpunit.testExplorer.functionRegex`             | The regular expression used to determine the functions within a file to test.                                                             | `\\s*(public\\s+){0,1}function\\s+(\\w*test\\w*)\\s*\\(` |
| `phpunit.testExplorer.multilineFunctionRegex`    | Determines if the functionRegex looks at multiple lines. This is useful if the test is defined by an annotation comment.                  | `false`                                                  |
| `phpunit.testExplorer.parallelTests`             | The number of tests to run in parallel in the test explorer.                                                                              | `0`                                                      |
| `phpunit.testExplorer.showOutput`                | Show the output console after the tests run (always, error, never).                                                                       | `never`                                                  |
| `phpunit.testExplorer.timeout`                   | The time (seconds) to allow a test to run. The default is no timeout.                                                                     | `0`                                                      |
| `phpunit.testExplorer.verboseTestExplorerOutput` | Setting to true forces test explorer to run individual tests instead of only running the class test to get output for each test.          | `false`                                                  |

## Combined Settings

- `execPath` determines the phpunit path.
- `envVars` allows this extension to hook into the debugger ([github.com/felixfbecker/vscode-php-debug](https://github.com/felixfbecker/vscode-php-debug)) as show in the setup section.

## Command Line Settings

- `args` allows phpunit to run with any available arguments shown in _phpunit --help_
- `excludedGroups` excludes the given groups when running the _TestSuiteWithExclusions_ command.
- `scriptsAfterTest` runs the given scripts based upon the pass/fail status of the test.
- `showOutput` determines when to show the output console after the tests run. I would recommend leaving this as the default _always_.

## Test Explorer Settings

- `args` allows setting arguments for the tests. Some arguments, such as --testdox, will not allow the test explorer tests to pass.
- `discoverAllTests` allows all tests with paths that match the `folderPattern` glob AND the `fileRegex` to be added to the test explorer.
- `fileRegex` is used to determine the files to add to the test explorer.
- The file in the active editor is added based solely upon the `fileRegex`.
- `folderPattern` is only used when `discoverAllTests` is set to `true`.
- `functionRegex` sets the regex to find functions within a test file.
- `multilineFunctionRegex` allows the functionRegex to look at multiple lines. The functionRegex adds the `s` flag.
- `parallelTests` allows multiple tests to run concurrently. I would not recommend setting this above `8`.
- `showOutput` is similar to the command line setting of the same name. Shows the output console when specified.
- `timeout` sets the time a test can run. A test that does not complete before the timeout will be cancelled.
- `verboseTestExplorerOutput` allows output to show for each test, but can take longer to run.

## How to use

Run with (`Cmd+Shift+P` on OSX or `Ctrl+Shift+P` on Windows and Linux) and execute:

- `PHPUnit Test Nearest`: This command will search the nearest function from the cursor position until the file's beginning.

![test-nearest](images/test-nearest.gif)

- `PHPUnit Test Current File`: This command will test the current active file.

![test-file](images/test-file.gif)

- `PHPUnit Test All Suite`: This command will run all the test suite.

![test-suite](images/test-suite.gif)

- `PHPUnit Test All Suite With Exclusions`: This command will run the test suite without the excluded groups set in the configuration.

- `PHPUnit Test`: This command will show a window to pick the test to run.

![test-pick](images/test-pick.gif)

- `PHPUnit Run Last Test`: This command will run the last test ran.

![test-last](images/test-last.gif)

- `PHPUnit Cancel Current Test`: This command will cancel the current running test.

![test-cancel](images/test-cancel.gif)

## Credits / Links

- [santigarcor](https://github.com/santigarcor/vscode-phpunit-extended)
- [VSCode's Extensions Samples](https://github.com/microsoft/vscode-extension-samples/tree/main/test-provider-sample)
- [VSCode's Testing Documentation](https://code.visualstudio.com/api/extension-guides/testing)

## License

The MIT License (MIT). Please see the [license file](LICENSE.md) for more information.
