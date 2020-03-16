import { TYPES } from '../constants';
import { join, replace } from 'ramda';
import { CodeActionProvider } from 'vscode';
import VariableActionProvider from './actionProviders/varActionProvider';

const modifiers = [
    'public',
    'private',
    'protected',
];

const modifierRegexp = `(${join('|', modifiers)})`;
const staticModifier = `(static\\s+)?`;
const regex = new RegExp(`${modifierRegexp}\\s+${staticModifier}\\w+\\s+\\w+\\s*;`);

const PROVIDERS = {
    [TYPES.VAR]: VariableActionProvider,
    [TYPES.UNKNOWN]: undefined,
};

export const getLineType = (lineText: string): string => {
    const lowerCase = lineText.toLowerCase();
    const isVar = regex.test(lowerCase);
    if (isVar) {
        return TYPES.VAR;
    }
    return TYPES.UNKNOWN;
};
