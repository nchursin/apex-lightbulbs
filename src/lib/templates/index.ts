import * as path from 'path';
import { promises } from 'fs';
const { readFile } = promises;
import * as template from 'es6-template-strings';

const templatePath = (templateName: string) => path.resolve(__dirname, templateName);

const fileContentsDecorator = (name: string) => async () => {
    if (!fileContents[`_${name}`]) {
        fileContents[`_${name}`] = await readFile(templatePath(`${name}.apex`), 'UTF-8');
    }
    return fileContents[`_${name}`];
};

const fileContents: any = {};

const templateTexts = {
    constructor: fileContentsDecorator('constructor'),
    constructorWithParams: fileContentsDecorator('constructorWithParams'),
};

export namespace Templates {
    export const constructor = async (params: { indent: string, className: string }) => {
        const templateText = await templateTexts.constructor();
        return template(templateText, params);
    };

    export const constructorWithParams = async (
        params: {
            indent: string
            className: string
            singleIndent: string
            parameters: string
            parametersAssignment: string
        }
    ) => {
        const templateText = await templateTexts.constructorWithParams();
        return template(templateText, params);
    };
}
