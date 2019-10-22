import * as vscode from 'vscode';
import { logstashCompletionItemProvider, logstashHoverProvider } from "./editor";

const LOGSTASH_LANGUAGE = 'logstash';

export function activate(context: vscode.ExtensionContext): void {

	// on completion
	const completionItemProvider = vscode.languages.registerCompletionItemProvider(LOGSTASH_LANGUAGE, logstashCompletionItemProvider);

	// on focus
	const hoverProvider = vscode.languages.registerHoverProvider(LOGSTASH_LANGUAGE, logstashHoverProvider);

	context.subscriptions.push(completionItemProvider, hoverProvider);
}
