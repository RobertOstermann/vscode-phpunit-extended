import * as vscode from 'vscode';

import { PhpUnit } from '../phpUnit';

export class TestSuite {

    private args: string[];
    private outputChannel: vscode.OutputChannel;
    private withExclutions: boolean;

    constructor(args: string[], outputChannel: vscode.OutputChannel, withExclutions = false) {
        this.args = args;
        this.outputChannel = outputChannel;
        this.withExclutions = withExclutions;
    }

    public run() {
        const config = vscode.workspace.getConfiguration("phpunit");

        if (this.withExclutions) {
            this.args.push('--exclude-group');
            this.args.push(config.get<Array<string>>("excludedGroups", []).join(','));
        }

        (new PhpUnit(this.outputChannel, this.args, false)).run();
    }
}
