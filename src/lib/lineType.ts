import { TYPES } from '../constants';
import { join } from 'ramda';

const modifiers = [
    'public',
    'private',
    'protected',
];

const annotation = `(@\\w+\\s+)?`;
const modifierRegexp = `((${join('|', modifiers)})\\s+)?`;
const staticModifier = `(static\\s+)?`;
const regex = new RegExp(`^${annotation}${modifierRegexp}${staticModifier}\\w+\\s+\\w+\\s*;`);

export const getLineType = (lineText: string): string => {
    const lowerCase = lineText.toLowerCase();
    const isVar = regex.test(lowerCase);
    if (isVar) {
        return TYPES.VAR;
    }
    return TYPES.UNKNOWN;
};
