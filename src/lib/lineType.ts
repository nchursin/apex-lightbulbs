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
    let result: LineMetadata;
    const lowerCase = lineText.toLowerCase();
    const isVar = regex.test(lowerCase);
    if (isVar) {
        const matches = lowerCase.match(regex);
        result = new LineMetadata(TYPES.VAR);
        result.isStatic = Boolean(matches && matches[staticKeywordGroupNumber]);
    } else {
        result = new LineMetadata(TYPES.UNKNOWN);
    }
    return result;
};

export class LineMetadata {
    public type: string;
    public isStatic: boolean | undefined;

    constructor(type: string) {
        this.type = type;
    }
}
