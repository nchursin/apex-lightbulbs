import { TextDocument, WorkspaceEdit, Range, Position } from "vscode";

export const replaceDocumentText = (textDocument: TextDocument, textToSet: string) => {
    const edit = new WorkspaceEdit();
    const lineCount = textDocument.lineCount;
    const lastLine = textDocument.lineAt(lineCount - 1);

    edit.replace(textDocument.uri, new Range(new Position(0,0), lastLine.range.end), textToSet);
};
