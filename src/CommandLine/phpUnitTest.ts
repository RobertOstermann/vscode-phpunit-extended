import * as vscode from 'vscode';
import CommandLineConfiguration from './Helpers/configuration';

import { PhpUnit } from "./phpUnit";
import { CurrentFileTest } from './TestHandlers/currentFileTest';
import { NeareastTest } from './TestHandlers/neareastTest';
import { RunLastTest } from './TestHandlers/runLastTest';
import { SelectWindowTest } from './TestHandlers/selectWindowTest';
import { TestSuite } from './TestHandlers/testSuite';
import { TestHandler } from './utils';

export class TestRunner {
    private outputChannel: vscode.OutputChannel;

    constructor(channel: vscode.OutputChannel) {
        this.outputChannel = channel;
    }

    public runTest() {
        this.executeTest('select-window');
    }

    public runCurrentFileTest() {
        this.executeTest('current-file');
    }

    public runTestSuite() {
        this.executeTest('suite');
    }

    public runTestSuiteWithExclusions() {
        this.executeTest('suite-with-exclusions');
    }

    public runNearestTest() {
        this.executeTest('nearest');
    }

    public runLastTest() {
        this.executeTest('last');
    }

    public cancelCurrentTest() {
        PhpUnit.cancelCurrentTest();
    }

    private executeTest(type: string) {
        const args = [...CommandLineConfiguration.sharedArgs(), ...CommandLineConfiguration.args()];
        const editor = vscode.window.activeTextEditor;
        let testHandler: TestHandler;

        switch (type) {
            case 'select-window':
                testHandler = new SelectWindowTest(editor, args, this.outputChannel);
                break;
            case 'current-file':
                testHandler = new CurrentFileTest(args, this.outputChannel);
                break;
            case 'suite':
                testHandler = new TestSuite(args, this.outputChannel);
                break;
            case 'suite-with-exclusions':
                testHandler = new TestSuite(args, this.outputChannel, true);
                break;
            case 'nearest':
                testHandler = new NeareastTest(editor, args, this.outputChannel);
                break;
            case 'last':
                testHandler = new RunLastTest(this.outputChannel);
                break;
        }

        testHandler.run();
    }
}
