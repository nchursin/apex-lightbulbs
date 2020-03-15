import { TYPES } from '../constants';
import { join } from 'ramda';

const modifiers = [
    'public',
    'private',
];

const modifierRegexp = `(${join('|', modifiers)})`;
const regex = new RegExp(`${modifierRegexp}\\s+\\w+\\s+\\w+\\s*;`);

export const getLineType = (lineText: string) => {
    const lowerCase = lineText.toLowerCase();
    const isVar = regex.test(lowerCase);
    if (isVar) {
        return TYPES.VAR;
    }
    return TYPES.UNKNOWN;
};