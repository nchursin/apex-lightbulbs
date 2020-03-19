import { TYPES } from '../constants';
import { join, tail, find } from 'ramda';
import { types } from 'util';

const modifiers = [
    'public',
    'private',
    'protected',
];

const annotation = `(@\\w+\\s+)?`;
const accessModifier = `((${join('|', modifiers)})\\s+)?`;
const staticModifier = `(static\\s+)?`;
const typeName = '(?!(?:static|class))\\w+';
const varRegex = new RegExp(`^${annotation}${accessModifier}${staticModifier}${typeName}\\s+\\w+\\s*;`);

const methodRegex = new RegExp(`^${annotation}${accessModifier}${staticModifier}\\w+\\s+\\w+\\s*\\(.*`);

export const getLineMetadata = (lineText: string): LineMetadata => {
    const result = new LineMetadata(lineText);
    return result;
};

const metaChecks = [
    {
        regex: varRegex,
        type: TYPES.VAR,
        staticKeywordGroupNumber: 4,
    },
    {
        regex: methodRegex,
        type: TYPES.METHOD,
        staticKeywordGroupNumber: 4,
    },
];

export class LineMetadata {
    public type: string;
    public isStatic: boolean | undefined;

    constructor(lineText: string) {
        this.type = TYPES.UNKNOWN;
        const lowerCase = lineText.toLowerCase();
        const config = find((metaCheckConfig) => metaCheckConfig.regex.test(lowerCase), metaChecks);
        if (config) {
            this.type = config.type;
            const matches = lowerCase.match(config.regex);
            this.isStatic = Boolean(matches && matches[config.staticKeywordGroupNumber]);
        }
    }
}
