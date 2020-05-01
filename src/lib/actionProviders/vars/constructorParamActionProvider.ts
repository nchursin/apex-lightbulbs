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

        if (symbol && this.suitableFor.includes(symbol.kind)) {
            const addGetSetAction = this.getConstructorParamAction(document, symbol, symbols);
            result.push(addGetSetAction);
        }
        return result;
    }

    private getConstructorParamAction(
        document: vscode.TextDocument,
        varSymbol: vscode.SymbolInformation,
        classSymbols: vscode.SymbolInformation[]
    ): vscode.CodeAction {
        const action = new vscode.CodeAction(VARIABLE_ACTIONS.ADD_CONSTRUCTOR_PARAM, vscode.CodeActionKind.Refactor);
        action.edit = new vscode.WorkspaceEdit();

        const constructor = SymbolParser.findConstructor(classSymbols);

        if (!constructor) {
            return action;
        }

        const [ varName, varType ] = varSymbol.name.split(' : ');

        this.addConstructorParameterInsert(action.edit, document, constructor, [ varName, varType ]);
        this.addAssignmentInsert(action.edit, document, constructor, varName);

        return action;
    }

    private addConstructorParameterInsert(
        edit: vscode.WorkspaceEdit,
        document: vscode.TextDocument,
        constructorSymbol: vscode.SymbolInformation,
        [ varName, varType ]: string[]
    ) {
        let parameterText = `${varType} ${varName}`;
        if (!constructorSymbol.name.includes('()')) {
            // no params constructor
            parameterText = `, ${parameterText}`;
        }
        const positionToInsert = this.getPositionToInsertArgument(document, constructorSymbol);
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

    private getPositionToInsertArgument(document: vscode.TextDocument, constructorSymbol: vscode.SymbolInformation) {
        let indexToInsert;
        let lineNumberToCheck = constructorSymbol.location.range.end.line;

        while (!document.lineAt(lineNumberToCheck).text.includes(')')) {
            lineNumberToCheck++;
        }

        if (constructorSymbol.location.range.end.line === lineNumberToCheck) {
            indexToInsert = document.lineAt(lineNumberToCheck).text.indexOf(')');
        } else {
            lineNumberToCheck--;
            const lineToPrepend = document.lineAt(lineNumberToCheck);
            indexToInsert = lineToPrepend.range.end.character;
        }

        return new vscode.Position(
            lineNumberToCheck,
            indexToInsert
        );
    }
}
