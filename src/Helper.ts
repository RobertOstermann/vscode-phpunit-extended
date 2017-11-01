export class Helper {
    private readonly regex = {
        method: /\s*public*\s+function\s+(\w*)\s*\(/gi,
        class: /class\s+(\w*)\s*{?/gi
    };

    public getRegex() {
        return this.regex;
    }

    public getClassNameOrMethod(editor, type: string): string | undefined {
        if (!this.regex.hasOwnProperty(type)) {
            throw new Error('Invalid type property passed: ' + type);
        }

        let result = undefined;
        let position = 0;
        let modifier = 1;

        if (type === 'method') {
            position = editor.selection.active.line;
            modifier = -1;
        }

        while (result === undefined && position > -1) {
            let line = editor.document.lineAt(position);
            let regexResult = null;

            if ((regexResult = this.regex[type].exec(line.text))) {
                result = regexResult[1].toString().trim();
            }

            position += modifier;
        }

        return result;
    }
}
