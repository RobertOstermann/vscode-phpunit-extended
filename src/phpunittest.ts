import * as vscode from 'vscode';
import { SelectWindowTest } from './TestHandlers/SelectWindowTest';
import { CurrentFileTest } from './TestHandlers/CurrentFileTest';
import { TestSuite } from './TestHandlers/TestSuite';
import { NeareastTest } from './TestHandlers/NeareastTest';
import { RunLastTest } from './TestHandlers/RunLastTest';
import { PhpUnit } from "./phpUnit";
import { TestHandler } from './utils';
import cp = require('child_process');
import fs = require('fs');

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
        let config = vscode.workspace.getConfiguration("phpunit");
        let args = [].concat(config.get<Array<string>>("args", []));
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
