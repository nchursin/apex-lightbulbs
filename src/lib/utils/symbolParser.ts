import { SymbolInformation } from 'vscode';
import { find, findLast, not, compose, last } from 'ramda';
import { SYMBOL_KIND } from '@constants';

const getStartLine = (symbol: SymbolInformation) => symbol.location.range.start.line;
const isPropertyOrField = (symbol: SymbolInformation) => symbol.kind === SYMBOL_KIND.PROPERTY || symbol.kind === SYMBOL_KIND.FIELD;

namespace SymbolParser {
    export const findSymbolAtLine = (docSymbolResult: SymbolInformation[], lineNumber: number): SymbolInformation | undefined => {
        return find((symbol) => getStartLine(symbol) === lineNumber, docSymbolResult);
    };

    export const findFirstNonVarDefnLine = (docSymbolResult: SymbolInformation[]) => {
        if (1 === docSymbolResult.length) {
            // If class is empty - return first line after definition
            return getStartLine(docSymbolResult[0]) + 1;
        }
        const classDeclaration = last(docSymbolResult);
        if (!classDeclaration) {
            return 0;
        }
        const firstNonVar = find(
            compose(not, isPropertyOrField),
            docSymbolResult
        );
        let result: number;
        // if start line is 0, it means no non-var declarations exist
        if (firstNonVar && getStartLine(firstNonVar) !== getStartLine(classDeclaration)) {
            result = getStartLine(firstNonVar);
        } else {
            const lastVar = findLast(
                isPropertyOrField,
                docSymbolResult
            );
            if (!lastVar) {
                throw new Error('No symbols found');
            }
            result = getStartLine(lastVar) + 1;
        }
        return result;
    };
}

export default SymbolParser;
