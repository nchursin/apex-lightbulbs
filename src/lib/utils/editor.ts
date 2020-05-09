import { join, compose, repeat } from 'ramda';
import { window } from 'vscode';

const repeatString = compose<string, number, string[], string>(
    join(''),
    repeat
);

namespace Editor {
    export const editor = () => window.activeTextEditor;
    // TODO: stub vscode.window.activeTextEditor in test to avoid using the || hack
    export const isSpaceIndent = () => editor()?.options.insertSpaces || true;
    export const tabSize = () => Number(editor()?.options.tabSize || 4);
    export const singleIndent = isSpaceIndent() ? repeatString(' ', tabSize()) : '\t';

    export const getIndentation = (numberOfIndents: number) => repeatString(singleIndent, numberOfIndents);
}

export default Editor;
