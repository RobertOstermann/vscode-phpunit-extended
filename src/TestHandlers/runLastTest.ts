import * as vscode from 'vscode';
import { PhpUnit } from '../phpUnit';

export class RunLastTest {

    private outputChannel: any;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    public run() {
        if (PhpUnit.lastCommand == null) {
            this.outputChannel.appendLine("No previous test available.");
            this.outputChannel.show();
        } else {
            let phpunit = new PhpUnit(
                this.outputChannel,
                PhpUnit.lastCommand.args,
                PhpUnit.lastCommand.putFsPathIntoArgs
            );

            phpunit.execPhpUnit(
                PhpUnit.lastCommand.phpunitPath,
                PhpUnit.lastCommand.workingDirectory
            );
        }
    }
}
