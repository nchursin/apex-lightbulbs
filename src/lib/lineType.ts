import { TYPES } from '../constants';
import { join, replace } from 'ramda';
import { CodeActionProvider } from 'vscode';
import { GetterSetterActionProvider } from './actionProviders';

const modifiers = [
    'public',
    'private',
    'protected',
];

const annotation = `(@\\w+\\s+)?`;
const modifierRegexp = `((${join('|', modifiers)})\\s+)?`;
const staticModifier = `(static\\s+)?`;
const regex = new RegExp(`^${annotation}${modifierRegexp}${staticModifier}\\w+\\s+\\w+\\s*;`);

const PROVIDERS = {
    [TYPES.VAR]: GetterSetterActionProvider,
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
