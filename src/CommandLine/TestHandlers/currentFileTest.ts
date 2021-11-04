import * as vscode from 'vscode';

import { PhpUnit } from '../phpUnit';

export class CurrentFileTest {
    private args: string[];
    private outputChannel: any;

    constructor(args: string[], outputChannel: vscode.OutputChannel) {
        this.args = args;
        this.outputChannel = outputChannel;
    }

    public run() {
        (new PhpUnit(this.outputChannel, this.args)).run();
    }
}
