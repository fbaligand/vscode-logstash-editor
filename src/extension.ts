import * as vscode from 'vscode';
import { logstashCompletionItemProvider, logstashHoverProvider } from './editor';
import { logstashDocumentFormattingEditProvider, logstashDocumentRangeFormattingEditProvider } from './formattingProvider';

const LOGSTASH_LANGUAGE = 'logstash';

export function activate(context: vscode.ExtensionContext): void {

	// on completion
	const completionItemProvider = vscode.languages.registerCompletionItemProvider(LOGSTASH_LANGUAGE, logstashCompletionItemProvider);

	// on focus
	const hoverProvider = vscode.languages.registerHoverProvider(LOGSTASH_LANGUAGE, logstashHoverProvider);

	// on document formatting
	const documentFormattingEditProvider = vscode.languages.registerDocumentFormattingEditProvider(LOGSTASH_LANGUAGE, logstashDocumentFormattingEditProvider);
	const documentRangeFormattingEditProvider = vscode.languages.registerDocumentRangeFormattingEditProvider(LOGSTASH_LANGUAGE, logstashDocumentRangeFormattingEditProvider);

	context.subscriptions.push(completionItemProvider, hoverProvider, documentFormattingEditProvider, documentRangeFormattingEditProvider);
}
