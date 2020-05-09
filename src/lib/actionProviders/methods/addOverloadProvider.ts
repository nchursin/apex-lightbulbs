import * as vscode from 'vscode';
import { SymbolKind, SymbolInformation } from 'vscode-languageclient';
import { COMMANDS } from '@constants';
import { METHOD_ACTIONS, PLACEHOLDERS } from '@labels';
import { BaseProvider } from '../baseProvider';
import { compose, splitEvery, filter, identity, takeLastWhile, not, equals, map, join, findIndex, remove, tail, split, flatten } from 'ramda';
import { Editor } from '@utils';

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
    ): Promise<vscode.CodeAction> {
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
        console.log('commands >> ', commands.filter((c) => c === COMMANDS.ADD_OVERLOAD));

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
        actionableSymbol: SymbolInformation,
        allSymbols: SymbolInformation[]
    ) {
        console.log('>>> commandCallback <<<');
        try {
            const methodName = actionableSymbol.name.split('(')[0];
            const declarationLine = document.lineAt(actionableSymbol.location.range.start.line);
            const declarationText = declarationLine.text;

            const getMethodArguments = compose(
                map(join(' ')),
                splitEvery(2),
                filter((el) => Boolean(identity(el))),
                takeLastWhile(
                    compose(
                        not,
                        equals(methodName)
                    )
                )
            );

            const declarationSplitByWords = declarationText.split(/[\s\(\)\{,]/);
            const methodArgs = getMethodArguments(declarationSplitByWords);

            const selected = await this.pickArgument(methodArgs);
            if (!selected) {
                return;
            }

            const value = await this.getDefaultValue();

            const edit = new vscode.WorkspaceEdit();

            const declarationBeforeArgs = declarationText.split(methodName)[0] + methodName;

            const selectedArgIndex = findIndex(equals(selected.label), methodArgs);
            const newArgs = remove(selectedArgIndex, 1, methodArgs);
            const argsToPass = flatten(map(
                compose(
                    tail,
                    split(' ')
                ),
                methodArgs
            ));
            argsToPass.splice(selectedArgIndex, 1, [ value || 'null' ]);

            const indent = Editor.singleIndent;

            const newDeclaration = `${declarationBeforeArgs}(${newArgs.join(', ')}) {\n`;
            const callText = `${indent}${indent}return ${methodName}(${argsToPass.join(', ')});\n`;
            const close = `${indent}}\n\n`;

            const newText = `${newDeclaration}${callText}${close}`;

            edit.insert(document.uri, declarationLine.range.start, newText);

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
}
