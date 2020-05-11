import * as vscode from 'vscode';
import { SymbolKind, SymbolInformation } from 'vscode-languageclient';
import { COMMANDS } from '@constants';
import { METHOD_ACTIONS, PLACEHOLDERS } from '@labels';
import { BaseProvider } from '../baseProvider';
import { compose, splitEvery, filter, identity, takeLastWhile, not, equals, map, join, findIndex, remove, tail, split, flatten, repeat } from 'ramda';
import { Editor, SymbolParser } from '@utils';

export class AddOverloadActionProvider extends BaseProvider {

    public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.Refactor
    ];

    public getActionableSymbolKinds() {
        return [ SymbolKind.Method ];
    }

    protected async getAction(
        document: vscode.TextDocument,
        actionableSymbol: SymbolInformation,
        allSymbols: SymbolInformation[]
    ): Promise<vscode.CodeAction | undefined> {
        if (actionableSymbol.name.includes('()')) {
            return;
        }

        await this.registerCommand();
        const action = new vscode.CodeAction(METHOD_ACTIONS.ADD_OVERLOAD, vscode.CodeActionKind.Refactor);
        action.command = {
            command: COMMANDS.ADD_OVERLOAD,
            title: METHOD_ACTIONS.ADD_OVERLOAD,
            arguments: [
                document,
                actionableSymbol,
                allSymbols,
            ],
        };

        const commands = await vscode.commands.getCommands();

        return action;
    }

    private async registerCommand() {
        const commands = await vscode.commands.getCommands();
        const filtered = commands.filter((c) => c === COMMANDS.ADD_OVERLOAD);

        if (!filtered.length) {
            vscode.commands.registerCommand(
                COMMANDS.ADD_OVERLOAD,
                this.commandCallback,
                this
            );
        }
    }

    private async commandCallback(
        document: vscode.TextDocument,
        methodSymbol: SymbolInformation,
        allSymbols: SymbolInformation[]
    ) {
        try {
            const methodArgs = SymbolParser.getMethodArguments(methodSymbol, document);

            const selected = await this.pickArgument(methodArgs);
            if (!selected) {
                return;
            }

            const value = await this.getDefaultValue();

            const edit = this.createEdit(selected, value, methodArgs, methodSymbol, document, allSymbols);
            await vscode.workspace.applyEdit(edit);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    private pickArgument(methodArguments: string[]) {
        const items: vscode.QuickPickItem[] = methodArguments.map(
            (label) => ({
                label,
            })
        );
        const quickPickOpts: vscode.QuickPickOptions = {
            placeHolder: PLACEHOLDERS.ADD_OVERLOAD.QUICK_PICK_ARGS,
        };
        return vscode.window.showQuickPick(items, quickPickOpts);
    }

    private getDefaultValue() {
        const inputBoxOpts: vscode.InputBoxOptions = {
            placeHolder: 'Enter default value',
        };
        return vscode.window.showInputBox(inputBoxOpts);
    }

    private createEdit(
        selected: vscode.QuickPickItem,
        value: string = 'null',
        methodArgs: string[],
        methodSymbol: SymbolInformation,
        document: vscode.TextDocument,
        allSymbols: SymbolInformation[]
    ) {
        const edit = new vscode.WorkspaceEdit();
        const methodName = SymbolParser.getSymbolName(methodSymbol);

        const methodReturnType = SymbolParser.getSymbolReturnType(methodSymbol);

        const declarationLine = document.lineAt(methodSymbol.location.range.start.line);
        const declarationText = declarationLine.text;

        const declarationBeforeArgs = declarationText.split(methodName)[0] + methodName;

        const { newArgumentSequence, passingArgumentsValues } = this.convertArguments(selected.label, methodArgs, value);


        const returnKeyword = (methodReturnType === 'void') ? '' : 'return ';
        const parentClass = SymbolParser.getParentClass(methodSymbol, allSymbols);
        const parentClassName = parentClass?.name || 'classname';
        const indentsCount = parentClassName.split('.').length;

        const indent = Editor.getIndentation(indentsCount);

        const newDeclaration = `${declarationBeforeArgs}(${newArgumentSequence.join(', ')}) {\n`;
        const callText = `${indent}${Editor.singleIndent}${returnKeyword}${methodName}(${passingArgumentsValues.join(', ')});\n`;
        const close = `${indent}}\n\n`;

        const newText = `${newDeclaration}${callText}${close}`;

        edit.insert(document.uri, declarationLine.range.start, newText);

        return edit;
    }

    private convertArguments(argToOverload: string, methodArgs: string[], value: string) {
        const selectedArgIndex = findIndex(equals(argToOverload), methodArgs);
        const newArgumentSequence = remove(selectedArgIndex, 1, methodArgs);

        const passingArgumentsValues = flatten(map(
            compose(
                tail,
                split(' ')
            ),
            methodArgs
        ));
        passingArgumentsValues.splice(selectedArgIndex, 1, [ value ]);

        return {
            newArgumentSequence,
            passingArgumentsValues,
        };
    }
}
