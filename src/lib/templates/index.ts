import * as path from 'path';
import { promises } from 'fs';
const { readFile } = promises;

const templatePath = (templateName: string) => path.resolve(__dirname, templateName);

export const constructor = () => readFile(templatePath('constructor.apex'), 'UTF-8');
