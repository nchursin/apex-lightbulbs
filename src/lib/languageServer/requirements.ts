/*
* Copyright (c) 2017, salesforce.com, inc.
* All rights reserved.
* Licensed under the BSD 3-Clause license.
* For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/

// From https://github.com/redhat-developer/vscode-java
// Original version licensed under the Eclipse Public License (EPL)

import * as cp from 'child_process';
import { workspace } from 'vscode';
import pathExists = require('path-exists');

// tslint:disable-next-line:no-var-requires
const expandHomeDir = require('expand-home-dir');
// tslint:disable-next-line:no-var-requires
const findJavaHome = require('find-java-home');

const SET_JAVA_DOC_LINK = 'https://forcedotcom.github.io/salesforcedx-vscode/articles/getting-started/java-setup';


export const JAVA_HOME_KEY = 'salesforcedx-vscode-apex.java.home';
export const JAVA_MEMORY_KEY = 'salesforcedx-vscode-apex.java.memory';
export interface RequirementsData {
    java_home: string;
    java_memory: number | null;
}

/**
* Resolves the requirements needed to run the extension.
* Returns a promise that will resolve to a RequirementsData if all requirements are resolved.
*/
export async function resolveRequirements(): Promise<RequirementsData> {
    const javaHome = await checkJavaRuntime();
    const javaMemory: number | null = workspace
    .getConfiguration()
    .get<number | null>(JAVA_MEMORY_KEY, null);
    await checkJavaVersion(javaHome);
    return Promise.resolve({
        java_home: javaHome,
        java_memory: javaMemory
    });
}

function checkJavaRuntime(): Promise<string> {
    return new Promise((resolve, reject) => {
        let source: string;
        let javaHome: string | undefined = readJavaConfig();

        if (javaHome) {
            source = 'The salesforcedx-vscode-apex.java.home setting defined in VS Code settings';
        } else {
            javaHome = process.env['JDK_HOME'];

            if (javaHome) {
                source = 'The JDK_HOME environment variable';
            } else {
                javaHome = process.env['JAVA_HOME'];
                source = 'The JAVA_HOME environment variable';
            }
        }

        if (javaHome) {
            javaHome = expandHomeDir(javaHome) as string;
            if (!pathExists.sync(javaHome)) {
                return reject(
                    `${source} points to a missing folder. For information on how to setup the Salesforce Apex extension, see [Set Your Java Version](${SET_JAVA_DOC_LINK}).`
                );
            }
            return resolve(javaHome);
        }

        // Last resort, try to automatically detect
        findJavaHome((err: Error, home: string) => {
            if (err) {
                return reject(
                    'Java runtime could not be located. Set one using the salesforcedx-vscode-apex.java.home VS Code setting. For more information, go to [Set Your Java Version](${SET_JAVA_DOC_LINK}).'
                );
            } else {
                return resolve(home);
            }
        });
    });
}

function readJavaConfig(): string {
    const config = workspace.getConfiguration();
    return config.get<string>('salesforcedx-vscode-apex.java.home', '');
}

function checkJavaVersion(javaHome: string): Promise<any> {
    return new Promise((resolve, reject) => {
        cp.execFile(
            javaHome + '/bin/java',
            ['-version'],
            {},
            (error, stdout, stderr) => {
                if (
                    stderr.indexOf('build 1.8') < 0 &&
                    stderr.indexOf('build 11.') < 0
                ) {
                    reject('An unsupported Java version was detected. Download and install [Java 8](https://java.com/en/download/) or [Java 11](https://www.oracle.com/technetwork/java/javase/downloads/jdk11-downloads-5066655.html) to run the extensions. For more information, see [Set Your Java Version](${SET_JAVA_DOC_LINK}).');
                } else {
                    resolve(true);
                }
            }
        );
    });
}
