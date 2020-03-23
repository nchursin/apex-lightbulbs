import * as vscode from "vscode";
import { CLASS_ACTIONS } from "../../../labels";
import { SYMBOL_KIND } from "../../../constants";
import { split, findIndex, equals, reject, match, head, join, repeat } from "ramda";
import { LanguageClient } from "vscode-languageclient";
import { getSymbolAtLine, getFirstNonVarDefnLine, singleIndent, isSpaceIndent } from "../../utils";

const modifiers = [
    'public',
    'private',
    'protected',
];
const annotation = `(@\\w+\\s+)?`;
const modifierRegexp = `((${join('|', modifiers)})\\s+)?`;
const staticModifier = `(static\\s+)?`;
const endOfDeclaration = '(;|{\\s*((get|set).+)?)';
const varType = '(?!(?:class))\\w+';
const finalRegexpString = `^${annotation}${modifierRegexp}${staticModifier}${varType}\\s+\\w+\\s*${endOfDeclaration}`;
const regex = new RegExp(finalRegexpString);

export class AddConstructorProvider implements vscode.CodeActionProvider {
    private languageClient: LanguageClient;

    public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.Refactor
	];

    constructor(languageClient: LanguageClient) {
        this.languageClient = languageClient;
    }

    public async provideCodeActions(document: vscode.TextDocument, range: vscode.Range): Promise<vscode.CodeAction[]> {
        const result: vscode.CodeAction[] = [];
        const symbol = await getSymbolAtLine(range.start.line, document, this.languageClient);
        if (SYMBOL_KIND.CLASS !== symbol?.kind) {
            return result;
        }

        const addConstructorAction = await this.constructTheAction(document, symbol?.name || '');

        return [
            addConstructorAction,
        ];
    }

    private async constructTheAction(document: vscode.TextDocument, className: string): Promise<vscode.CodeAction> {
        const lineToAddConstructor = await getFirstNonVarDefnLine(document, this.languageClient);
        const addConstructorAction = new vscode.CodeAction(CLASS_ACTIONS.ADD_CONSTRUCTOR, vscode.CodeActionKind.Refactor);

        const text = `\n${singleIndent}public ${className}() {\n${singleIndent}}\n`;
        addConstructorAction.edit = new vscode.WorkspaceEdit();
        addConstructorAction.edit.insert(document.uri, new vscode.Position(lineToAddConstructor, 0), text);

        return addConstructorAction;
    }
}
