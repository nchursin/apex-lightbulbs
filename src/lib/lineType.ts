import { TYPES } from '../constants';
import { join, tail } from 'ramda';
import { types } from 'util';

const modifiers = [
    'public',
    'private',
    'protected',
];

const annotation = `(@\\w+\\s+)?`;
const accessModifier = `((${join('|', modifiers)})\\s+)?`;
const staticModifier = `(static\\s+)?`;
const varRegex = new RegExp(`^${annotation}${accessModifier}${staticModifier}\\w+\\s+\\w+\\s*;`);

const methodRegex = new RegExp(`^${annotation}${accessModifier}${staticModifier}\\w+\\s+\\w+\\s*\\(.*`);

const staticKeywordGroupNumber = 4;

export const getLineMetadata = (lineText: string): LineMetadata => {
    const result = new LineMetadata(lineText);
    return result;
};

export class LineMetadata {
    public type: string;
    public isStatic: boolean | undefined;

    constructor(lineText: string) {
        this.type = TYPES.UNKNOWN;
        const lowerCase = lineText.toLowerCase();
        const isVar = varRegex.test(lowerCase);
        if (isVar) {
            const matches = lowerCase.match(varRegex);
            this.type = TYPES.VAR;
            this.isStatic = Boolean(matches && matches[staticKeywordGroupNumber]);
        } else {
            if (methodRegex.test(lowerCase)) {
                this.type = TYPES.METHOD;
                const matches = lowerCase.match(methodRegex);
                this.isStatic = Boolean(matches && matches[staticKeywordGroupNumber]);
            }
        }
    }
}
