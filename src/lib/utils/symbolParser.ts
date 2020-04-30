import { SymbolInformation } from 'vscode';
import { find, findLast, not, compose, last, dropLast } from 'ramda';
import { SYMBOL_KIND } from '@constants';

const getStartLine = (symbol: SymbolInformation): number => symbol.location.range.start.line;
const isPropertyOrField = (symbol: SymbolInformation) => symbol.kind === SYMBOL_KIND.PROPERTY || symbol.kind === SYMBOL_KIND.FIELD;

const findFirstNonVarDeclaration = find(compose(not, isPropertyOrField));
const findLastVarDeclaration = findLast(isPropertyOrField);

namespace SymbolParser {
    export const findSymbolAtLine = (docSymbolResult: SymbolInformation[], lineNumber: number): SymbolInformation | undefined => {
        return find((symbol) => getStartLine(symbol) === lineNumber, docSymbolResult);
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
}

export default SymbolParser;
