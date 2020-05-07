// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// import 'module-alias/register';

import * as path from 'path';

import { GetterSetterActionProvider, ConstructorParamActionProvider } from '@actionProviders/vars';
import { AddConstructorProvider } from '@actionProviders/classes';
import * as languageServer from '@languageServer/languageServer';
import { telemetryService } from '@languageServer/telemetry';
import { LanguageClient } from 'vscode-languageclient';
import { BaseProvider } from './lib/actionProviders/baseProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    let languageClient: LanguageClient;
    try {
        global.assets = path.resolve(context.extensionPath, 'assets');
        const langClientHRStart = process.hrtime();
        languageClient = await languageServer.createLanguageServer();
        // languageClientUtils.setClientInstance(languageClient);
        const handle = languageClient.start();
        // languageClientUtils.setStatus(ClientStatus.Indexing, '');
        context.subscriptions.push(handle);

        languageClient
            .onReady()
            .then(async () => {
                if (languageClient) {
                    languageClient.onNotification('indexer/done', async () => {});
                }
                // TODO: This currently keeps existing behavior in which we set the language
                // server to ready before it finishes indexing. We'll evaluate this in the future.
                // languageClientUtils.setStatus(ClientStatus.Ready, '');
                telemetryService.sendApexLSPActivationEvent(langClientHRStart);

                const actionProviders: BaseProvider[] = [
                    new ConstructorParamActionProvider(languageClient),
                    new AddConstructorProvider(languageClient),
                    new GetterSetterActionProvider(languageClient),
                ];

                actionProviders.forEach(
                    (provider) => context.subscriptions.push(
                        vscode.languages.registerCodeActionsProvider('apex', provider, {
                            providedCodeActionKinds: provider.getProvidedCodeActionsKind()
                        }))
                );
            })
            .catch(err => {
                console.error('ERROR: ', err);
                // Handled by clients
                telemetryService.sendApexLSPError(err);
                // languageClientUtils.setStatus(
                //   ClientStatus.Error,
                //   nls.localize('apex_language_server_failed_activate')
                // );
            });
    } catch (e) {
        console.error('ERROR: ', e);
        console.error('Apex language server failed to initialize');
        // languageClientUtils.setStatus(ClientStatus.Error, e);
    }
}

// this method is called when your extension is deactivated
export function deactivate() {}
