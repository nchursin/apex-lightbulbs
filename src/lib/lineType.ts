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

export const getLineMetadata = (lineText: string): { type: string } => {
    const result = {
        type: TYPES.UNKNOWN,
    };
    const lowerCase = lineText.toLowerCase();
    const isVar = regex.test(lowerCase);
    if (isVar) {
        result.type = TYPES.VAR;
    }
    return result;
};
