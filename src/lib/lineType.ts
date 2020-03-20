import { TYPES } from '../constants';
import { join, tail, find, split, findIndex, dropWhile } from 'ramda';
import { types } from 'util';
import { TextDocument } from 'vscode';

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

const classRegex = new RegExp(`^${annotation}${accessModifier}class\\s+\\w+\\s*{`);

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
    {
        regex: classRegex,
        type: TYPES.CLASS,
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
            if (config.staticKeywordGroupNumber) {
                this.isStatic = Boolean(matches && matches[config.staticKeywordGroupNumber]);
            } else {
                this.isStatic = false;
            }
        }
    }
}

export const getFirstNonVarDefnLine = (textDocument: TextDocument): number => {
    const text = textDocument.getText();
    const splitted = tail(split('\n', text));
    // splitted = dropWhile((elem) => {

    // }, splitted);
    const indexFirstNonVar = findIndex((lineText) => Boolean(lineText.trim()) && !varRegex.test(lineText.trim()), splitted);
    return indexFirstNonVar + 1;
};
