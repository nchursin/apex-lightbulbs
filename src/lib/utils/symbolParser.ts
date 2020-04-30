import { TextDocument, SymbolInformation, window } from 'vscode';
import { join, find, findLast, compose, repeat } from 'ramda';

namespace SymbolParser {
    export const findSymbolAtLine = (docSymbolResult: SymbolInformation[], lineNumber: number): SymbolInformation | undefined => {
        return find((symbol) => symbol.location.range.start.line === lineNumber, docSymbolResult);
    };

    export const findFirstNonVarDefnLine = (docSymbolResult: SymbolInformation[]) => {
        if (1 === docSymbolResult.length) {
            // If class is empty - return first line after definition
            return docSymbolResult[0].location.range.start.line + 1;
        }
        const firstNonVar = find((symbol) => symbol.kind !== 7 && symbol.kind !== 8, docSymbolResult);
        let result: number;
        if (firstNonVar && firstNonVar.location.range.start.line) {
            result = firstNonVar.location.range.start.line;
        } else {
            const lastVar = findLast((symbol) => symbol.kind === 7 || symbol.kind === 8, docSymbolResult);
            if (!lastVar) {
                throw new Error('No symbols found');
            }
            result = lastVar.location.range.start.line + 1;
        }
        return result;
    };
}

export default SymbolParser;
