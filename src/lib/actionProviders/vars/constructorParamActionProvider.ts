import * as vscode from 'vscode';
import { VARIABLE_ACTIONS } from '@labels';
import { SymbolParser, Editor } from "@utils";
import { SymbolKind, SymbolInformation } from 'vscode-languageclient';
import { repeat, join, last, match } from 'ramda';
import { Templates } from '@templates';
import { BaseProvider } from '@actionProviders/baseProvider';

export class ConstructorParamActionProvider extends BaseProvider {

    public getActionableSymbolKinds(): SymbolKind[] {
        return [ SymbolKind.Field, SymbolKind.Property ];
    }

    protected async getAction(
        document: vscode.TextDocument,
        varSymbol: SymbolInformation,
        allSymbols: SymbolInformation[]
    ) {
        const action = new vscode.CodeAction(VARIABLE_ACTIONS.ADD_CONSTRUCTOR_PARAM, vscode.CodeActionKind.Refactor);
        action.edit = new vscode.WorkspaceEdit();

        const containerClass = SymbolParser.getParentClass(varSymbol, allSymbols);
        if (!containerClass) {
            return;
        }
        const classSymbols = SymbolParser.getWholeClassMeta(containerClass, allSymbols);
        const constructor = SymbolParser.findConstructor(classSymbols);

        if (!constructor) {
            await this.addConstructorWithParams(action.edit, classSymbols, varSymbol, document);
        } else {
            const [ varName, varType ] = varSymbol.name.split(' : ');

            this.addConstructorParameterInsert(action.edit, document, constructor, [ varName, varType ]);
            this.addAssignmentInsert(action.edit, document, constructor, varName);
        }

        return action;
    }

    private addConstructorParameterInsert(
        edit: vscode.WorkspaceEdit,
        document: vscode.TextDocument,
        constructorSymbol: SymbolInformation,
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
        constructorSymbol: SymbolInformation,
        varName: string
    ) {
        let lineNumberToCheck = constructorSymbol.location.range.end.line;
        let lineToAdd = document.lineAt(lineNumberToCheck);

        while (!lineToAdd.text.includes('{')) {
            lineNumberToCheck++;
            lineToAdd = document.lineAt(lineNumberToCheck);
        }

        let lineNumberCheckForSuper = lineNumberToCheck + 1;
        while(!document.lineAt(lineNumberCheckForSuper).text.trim()) {
            lineNumberCheckForSuper++;
        }
        const superThisKeywordsRegex = /\b(super|this)\b\s*\(/;
        const textAtLineToCheckForSuper = document.lineAt(lineNumberCheckForSuper).text;
        const matches = match(superThisKeywordsRegex, textAtLineToCheckForSuper);
        if (matches.length) {
            lineToAdd = document.lineAt(lineNumberCheckForSuper);
        }

        const constructorDeclarationEnd = lineToAdd.range.end;

        const numberOfAdditionalIndents = constructorSymbol.name.split('.').length;
        const indents = join('', repeat(`${Editor.singleIndent}`, numberOfAdditionalIndents));

        const assignment = `\n${Editor.singleIndent}${indents}this.${varName} = ${varName};`;
        edit.insert(
            document.uri,
            constructorDeclarationEnd,
            assignment
        );
    }

    private getPositionToInsertArgument(document: vscode.TextDocument, constructorSymbol: SymbolInformation) {
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

    private async addConstructorWithParams(
        edit: vscode.WorkspaceEdit,
        classSymbols: SymbolInformation[],
        parameterSymbol: SymbolInformation,
        document: vscode.TextDocument
    ) {
        const lineToAddConstructor = SymbolParser.findFirstNonVarDeclarationLine(classSymbols);
        const classDeclarationSymbol = classSymbols[classSymbols.length - 1];

        const line = document.lineAt(lineToAddConstructor);
        const lineText = line.text.trim();

        const nameSplit = classDeclarationSymbol.name.split('.');
        const indent = join('', repeat(Editor.singleIndent, nameSplit.length));
        const [ varName, varType ] = parameterSymbol.name.split(' : ');
        let text = await Templates.constructorWithParams({
            indent,
            className: last(nameSplit) || '',
            singleIndent: Editor.singleIndent,
            parameters: `${varType} ${varName}`,
            parametersAssignment: `this.${varName} = ${varName};`,
        });
        if (lineText) {
            text = `\n${text}`;
        }

        edit.insert(document.uri, new vscode.Position(lineToAddConstructor, 0), text);
    }
}
