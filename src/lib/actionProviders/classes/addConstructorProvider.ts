import * as vscode from "vscode";
import { CLASS_ACTIONS } from "../../../labels";
import { SYMBOL_KIND } from "../../../constants";
import { constructor } from "../../templates";
import { join, find, last, equals, findIndex, slice, findLastIndex, repeat } from "ramda";
import { LanguageClient } from "vscode-languageclient";
import { ApexServer, SymbolParser, Editor } from "../../utils";
import * as template from 'es6-template-strings';

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
        const allSymbols = await ApexServer.getAllSymbols(document, this.languageClient);
        const providingSymbol = SymbolParser.findSymbolAtLine(allSymbols, range.start.line);
        if (SYMBOL_KIND.CLASS !== providingSymbol?.kind) {
            return result;
        }
        const classSymbols = this.getWholeClassMeta(providingSymbol, allSymbols);
        const constructor = find((symbol: vscode.SymbolInformation) => {
            return SYMBOL_KIND.CONSTRUCTOR === symbol.kind && symbol.name.startsWith(providingSymbol.name);
        }, classSymbols);
        if (constructor) {
            return result;
        }

        const addConstructorAction = await this.constructTheAction(classSymbols, document, providingSymbol);

        return [
            addConstructorAction,
        ];
    }

    private getWholeClassMeta(symbol: vscode.SymbolInformation, allSymbols: vscode.SymbolInformation[]) {
        const classDefnIndex = findIndex(equals(symbol), allSymbols);
        if (allSymbols.length === classDefnIndex + 1) {
            return allSymbols;
        }
        const previousSymbols = slice(0, classDefnIndex, allSymbols);
        const lastClassIndex = findLastIndex((s) => s.kind === SYMBOL_KIND.CLASS, previousSymbols);
        return slice(lastClassIndex + 1, classDefnIndex + 1, allSymbols);
    }

    private async constructTheAction(classSymbols: vscode.SymbolInformation[], document: vscode.TextDocument, providingSymbol: vscode.SymbolInformation): Promise<vscode.CodeAction> {
        let lineToAddConstructor = SymbolParser.findFirstNonVarDefnLine(classSymbols);
        const addConstructorAction = new vscode.CodeAction(CLASS_ACTIONS.ADD_CONSTRUCTOR, vscode.CodeActionKind.Refactor);

        const line = document.lineAt(lineToAddConstructor);
        const lineText = line.text.trim();

        const source = await constructor();
        const nameSplit = providingSymbol.name.split('.');
        const indent = join('', repeat(Editor.singleIndent, nameSplit.length));
        let text = template(source, { indent, className: last(nameSplit) });
        if (lineText) {
            text += '\n';
        }
        addConstructorAction.edit = new vscode.WorkspaceEdit();
        addConstructorAction.edit.insert(document.uri, new vscode.Position(lineToAddConstructor, 0), text);

        return addConstructorAction;
    }
}
