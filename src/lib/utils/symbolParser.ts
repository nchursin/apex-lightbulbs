import { SymbolInformation } from 'vscode-languageclient';
import { SymbolKind } from 'vscode-languageclient';
import { TextDocument } from 'vscode';
import * as R from 'ramda';

const propertyOrField: number[] = [ SymbolKind.Property, SymbolKind.Field ];

const getStartLine = (symbol: SymbolInformation): number => symbol.location.range.start.line;
const isPropertyOrField = (symbol: SymbolInformation) => propertyOrField.includes(symbol.kind);
const isConstructor = (symbol: SymbolInformation) => SymbolKind.Constructor === symbol.kind;

const findFirstNonVarDeclaration = R.find(R.compose(R.not, isPropertyOrField));
const findLastVarDeclaration = R.findLast(isPropertyOrField);

const isClassSymbol = (symbol: SymbolInformation) => SymbolKind.Class === symbol.kind;

namespace SymbolParser {
    export const findSymbolAtLine = (docSymbolResult: SymbolInformation[], lineNumber: number): SymbolInformation | undefined => {
        return R.find((symbol) => getStartLine(symbol) === lineNumber, docSymbolResult);
    };

    export const getSymbolName = (symbol: SymbolInformation) => symbol.name.split(':')[0].split('(')[0].trim();

    export const getSymbolReturnType = (symbol: SymbolInformation) => symbol.name.split(':')[1]?.trim();

    export const getParentClass = (symbol: SymbolInformation, allSymbols: SymbolInformation[]) => {
        const symbolIndex = R.findIndex(R.equals(symbol), allSymbols);
        const afterSymbol = R.flatten(R.tail(R.splitAt(symbolIndex, allSymbols)));
        return R.find(isClassSymbol, afterSymbol);
    };

    export const getDeclarationLine = (symbol: SymbolInformation, document: TextDocument) => document.lineAt(symbol.location.range.start.line);

    export const getMethodArguments = (methodSymbol: SymbolInformation, document: TextDocument) => {
        const declarationLine = SymbolParser.getDeclarationLine(methodSymbol, document);
        const methodName = SymbolParser.getSymbolName(methodSymbol);
        const declarationSplitByWords = declarationLine.text.split(/[\s\(\)\{,]/);

        const getMethodArguments = R.compose(
            R.map(R.join(' ')),
            R.splitEvery(2),
            R.filter((el) => Boolean(R.identity(el))),
            R.takeLastWhile(
                R.compose(
                    R.not,
                    R.equals(methodName)
                )
            )
        );

        return getMethodArguments(declarationSplitByWords);
    };

    export const findFirstNonVarDeclarationLine = (symbolInfos: SymbolInformation[]) => {
        let result: number;
        // classDeclaration always goes last
        const classDeclaration = R.last(symbolInfos);
        const inClassDeclarations = R.dropLast(1, symbolInfos);
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

    export const findConstructor = (classSymbols: SymbolInformation[]): SymbolInformation | undefined => {
        const classDeclaration = R.last(classSymbols);
        return classDeclaration && R.find((symbol: SymbolInformation) => {
            return isConstructor(symbol) && symbol.name.startsWith(`${classDeclaration.name}(`);
        }, classSymbols);
    };

    export const findAllConstructors = (classSymbols: SymbolInformation[]): SymbolInformation[] => {
        const classDeclaration = R.last(classSymbols);
        return classDeclaration && R.filter((symbol: SymbolInformation) => {
            return isConstructor(symbol) && symbol.name.startsWith(`${classDeclaration.name}(`);
        }, classSymbols) || [];
    };

    export const getWholeClassMeta = (symbol: SymbolInformation, allSymbols: SymbolInformation[]) => {
        const classDefnIndex = R.findIndex(R.equals(symbol), allSymbols);
        if (allSymbols.length === classDefnIndex + 1) {
            return allSymbols;
        }
        const previousSymbols = R.slice(0, classDefnIndex, allSymbols);
        const lastClassIndex = R.findLastIndex(isClassSymbol, previousSymbols);
        return R.slice(lastClassIndex + 1, classDefnIndex + 1, allSymbols);
    };
}

export default SymbolParser;
