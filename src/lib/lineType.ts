import { TYPES } from '../constants';
import { join, tail } from 'ramda';

const modifiers = [
    'public',
    'private',
    'protected',
];

const annotation = `(@\\w+\\s+)?`;
const modifierRegexp = `((${join('|', modifiers)})\\s+)?`;
const staticModifier = `(static\\s+)?`;
const regex = new RegExp(`^${annotation}${modifierRegexp}${staticModifier}\\w+\\s+\\w+\\s*;`);

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
        const isVar = regex.test(lowerCase);
        if (isVar) {
            const matches = lowerCase.match(regex);
            this.type = TYPES.VAR;
            this.isStatic = Boolean(matches && matches[staticKeywordGroupNumber]);
        }
    }
}
