import { TYPES } from '../constants';
import { join, replace } from 'ramda';

const modifiers = [
    'public',
    'private',
    'protected',
];

const modifierRegexp = `(${join('|', modifiers)})`;
const staticModifier = `(static\\s+)?`;
const regex = new RegExp(`${modifierRegexp}\\s+${staticModifier}\\w+\\s+\\w+\\s*;`);

export const addGetSet = (lineText: string) => {
    return replace(';', ' { get; set; }', lineText);
};

export const getLineType = (lineText: string) => {
    const lowerCase = lineText.toLowerCase();
    const isVar = regex.test(lowerCase);
    if (isVar) {
        return TYPES.VAR;
    }
    return TYPES.UNKNOWN;
};
