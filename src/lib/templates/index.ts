import * as path from 'path';
import { promises } from 'fs';
const { readFile } = promises;
import * as template from 'es6-template-strings';
const constructorTemplate = require('@assets/constructor.apex');

const templatePath = (templateName: string) => path.resolve(__dirname, templateName);

const fileContentsDecorator = (name: string) => () => {
    if (!fileContents[`_${name}`]) {
        fileContents[`_${name}`] = require(`@assets/${name}.apex`);
    }
    return fileContents[`_${name}`];
};

const fileContents: any = {};

const templateTexts = {
    constructor: fileContentsDecorator('constructor'),
    constructorWithParams: fileContentsDecorator('constructorWithParams'),
};

export namespace Templates {
    export const constructor = (params: { indent: string, className: string }) => {
        const templateText = templateTexts.constructor();
        return template(templateText, params);
    };

    export const constructorWithParams = (
        params: {
            indent: string
            className: string
            singleIndent: string
            parameters: string
            parametersAssignment: string
        }
    ) => {
        const templateText = templateTexts.constructorWithParams();
        return template(templateText, params);
    };
}
