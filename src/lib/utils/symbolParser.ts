import { SymbolInformation } from 'vscode-languageclient';
import { find, findLast, not, compose, last, dropLast, findIndex, equals, slice, findLastIndex } from 'ramda';
import { SymbolKind } from 'vscode-languageclient';
import { TextDocument } from 'vscode';
import * as R from 'ramda';

const propertyOrField: number[] = [ SymbolKind.Property, SymbolKind.Field ];

const getStartLine = (symbol: SymbolInformation): number => symbol.location.range.start.line;
const isPropertyOrField = (symbol: SymbolInformation) => propertyOrField.includes(symbol.kind);
const isConstructor = (symbol: SymbolInformation) => SymbolKind.Constructor === symbol.kind;

const findFirstNonVarDeclaration = find(compose(not, isPropertyOrField));
const findLastVarDeclaration = findLast(isPropertyOrField);

const isClassSymbol = (symbol: SymbolInformation) => SymbolKind.Class === symbol.kind;

namespace SymbolParser {
    export const findSymbolAtLine = (docSymbolResult: SymbolInformation[], lineNumber: number): SymbolInformation | undefined => {
        return find((symbol) => getStartLine(symbol) === lineNumber, docSymbolResult);
    };

    export const getSymbolName = (synbol: SymbolInformation) => synbol.name.split(':')[0].split('(')[0].trim();

    export const getSymbolReturnType = (synbol: SymbolInformation) => synbol.name.split(':')[1]?.trim();

    export const getDeclarationLine = (symbol: SymbolInformation, document: TextDocument) => document.lineAt(symbol.location.range.start.line);

    export const getMethodArguments = (methodSymbol: SymbolInformation, document: TextDocument) => {
        const declarationLine = SymbolParser.getDeclarationLine(methodSymbol, document);
        const methodName = SymbolParser.getSymbolName(methodSymbol);
        const declarationSplitByWords = declarationLine.text.split(/[\s\(\)\{,]/);

        const getMethodArguments = compose(
            R.map(R.join(' ')),
            R.splitEvery(2),
            R.filter((el) => Boolean(R.identity(el))),
            R.takeLastWhile(
                compose(
                    not,
                    equals(methodName)
                )
            )
        );

        return getMethodArguments(declarationSplitByWords);
    };

    export const findFirstNonVarDeclarationLine = (symbolInfos: SymbolInformation[]) => {
        let result: number;
        // classDeclaration always goes last
        const classDeclaration = last(symbolInfos);
        const inClassDeclarations = dropLast(1, symbolInfos);
        if (!classDeclaration) {
            // no class declaration (empty file?) - use first line
            result = 0;
        } else {
            const firstNonVar = findFirstNonVarDeclaration(inClassDeclarations);
            const lastVar = findLastVarDeclaration(inClassDeclarations);
            result = getStartLine(firstNonVar || lastVar || classDeclaration);
            if (!firstNonVar) {
                // either class is empty or var defn is used
                // That means the next line is the first non-var
                result++;
            }
        }
        return result;
    };

    export const findConstructor = (symbolInfos: SymbolInformation[]): SymbolInformation | undefined => {
        const classDeclaration = last(symbolInfos);
        return classDeclaration && find((symbol: SymbolInformation) => {
            return isConstructor(symbol) && symbol.name.startsWith(classDeclaration.name);
        }, symbolInfos);
    };

    export const getWholeClassMeta = (symbol: SymbolInformation, allSymbols: SymbolInformation[]) => {
        const classDefnIndex = findIndex(equals(symbol), allSymbols);
        if (allSymbols.length === classDefnIndex + 1) {
            return allSymbols;
        }
        const previousSymbols = slice(0, classDefnIndex, allSymbols);
        const lastClassIndex = findLastIndex(isClassSymbol, previousSymbols);
        return slice(lastClassIndex + 1, classDefnIndex + 1, allSymbols);
    };
}

export default SymbolParser;
