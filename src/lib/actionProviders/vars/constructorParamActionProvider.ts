import * as vscode from 'vscode';
import { VARIABLE_ACTIONS } from '@labels';
import { SYMBOL_KIND } from '@constants';
import { ApexServer, SymbolParser, Editor } from "@utils";
import { LanguageClient } from 'vscode-languageclient';

export class ConstructorParamActionProvider implements vscode.CodeActionProvider {
    private languageClient: LanguageClient | undefined;

    private suitableFor = [SYMBOL_KIND.FIELD, SYMBOL_KIND.PROPERTY];

    constructor(languageClient: LanguageClient | undefined = undefined) {
        this.languageClient = languageClient;
    }

    public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.Refactor
	];

	public async provideCodeActions(document: vscode.TextDocument, range: vscode.Range): Promise<vscode.CodeAction[]> {
        if (!this.languageClient) {
            throw new Error('Language Client is not provided');
        }

        const result = [];
        const symbols = await ApexServer.getAllSymbols(document, this.languageClient);
        const symbol = SymbolParser.findSymbolAtLine(symbols, range.start.line);

        if (symbol && (this.suitableFor.includes(symbol.kind))) {
            const addGetSetAction = this.getAddGetSetAction(document, symbol, symbols);
            result.push(addGetSetAction);
        }
        return result;
    }

    private getAddGetSetAction(
        document: vscode.TextDocument,
        varSymbol: vscode.SymbolInformation,
        classSymbols: vscode.SymbolInformation[]
    ): vscode.CodeAction {
        const addGetSetAction = new vscode.CodeAction(VARIABLE_ACTIONS.ADD_CONSTRUCTOR_PARAM, vscode.CodeActionKind.Refactor);
        addGetSetAction.edit = new vscode.WorkspaceEdit();

        const constructor = SymbolParser.findConstructor(classSymbols);

        if (!constructor) {
            return addGetSetAction;
        }

        const [ varName, varType ] = varSymbol.name.split(' : ');

        this.addConstructorParameterInsert(addGetSetAction.edit, document, constructor, [ varName, varType ]);
        this.addAssignmentInsert(addGetSetAction.edit, document, constructor, varName);

        return addGetSetAction;
    }

    private addConstructorParameterInsert(
        edit: vscode.WorkspaceEdit,
        document: vscode.TextDocument,
        constructorSymbol: vscode.SymbolInformation,
        [ varName, varType ]: string[]
    ) {
        let parameterText = `${varType} ${varName}`;
        let positionToInsert;
        if (constructorSymbol.name.includes('()')) {
            positionToInsert = new vscode.Position(
                constructorSymbol.location.range.end.line,
                constructorSymbol.location.range.end.character + 1
            );
        } else {
            const constructorLine = document.lineAt(constructorSymbol.location.range.end.line);
            const indexOfCloseBracket = constructorLine.text.indexOf(')');
            positionToInsert = new vscode.Position(
                constructorLine.lineNumber,
                indexOfCloseBracket
            );
            parameterText = `, ${parameterText}`;
        }
        edit.insert(
            document.uri,
            positionToInsert,
            parameterText
        );
    }

    private addAssignmentInsert(
        edit: vscode.WorkspaceEdit,
        document: vscode.TextDocument,
        constructorSymbol: vscode.SymbolInformation,
        varName: string
    ) {
        let lineNumberToCheck = constructorSymbol.location.range.end.line;
        let lineToAdd = document.lineAt(lineNumberToCheck);

        while (!lineToAdd.text.includes('{')) {
            lineNumberToCheck++;
            lineToAdd = document.lineAt(lineNumberToCheck);
        }

        const constructorDeclarationEnd = lineToAdd.range.end;
        const assignment = `\n${Editor.singleIndent}${Editor.singleIndent}this.${varName} = ${varName};`;
        edit.insert(
            document.uri,
            constructorDeclarationEnd,
            assignment
        );
    }
}
