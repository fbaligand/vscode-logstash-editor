import * as vscode from 'vscode';
import { logstashCompletionItemProvider, logstashHoverProvider } from './editor';
import { logstashDocumentFormattingEditProvider, logstashDocumentRangeFormattingEditProvider } from './formattingProvider';
import { setLogstashVersionCommandCallback, SET_LOGSTASH_VERSION_COMMAND_NAME } from './snippets/snippetsProvider';

const LOGSTASH_LANGUAGE = 'logstash';

export function activate(context: vscode.ExtensionContext): void {

	// on completion
	const completionItemProvider = vscode.languages.registerCompletionItemProvider(LOGSTASH_LANGUAGE, logstashCompletionItemProvider);

	// on focus
	const hoverProvider = vscode.languages.registerHoverProvider(LOGSTASH_LANGUAGE, logstashHoverProvider);

	// on document formatting
	const documentFormattingEditProvider = vscode.languages.registerDocumentFormattingEditProvider(LOGSTASH_LANGUAGE, logstashDocumentFormattingEditProvider);
	const documentRangeFormattingEditProvider = vscode.languages.registerDocumentRangeFormattingEditProvider(LOGSTASH_LANGUAGE, logstashDocumentRangeFormattingEditProvider);

	// add providers to extension subscriptions
	context.subscriptions.push(completionItemProvider, hoverProvider, documentFormattingEditProvider, documentRangeFormattingEditProvider);

	// command to set Logstash version
	vscode.commands.registerCommand(SET_LOGSTASH_VERSION_COMMAND_NAME, setLogstashVersionCommandCallback);

}
