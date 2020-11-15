import * as vscode from 'vscode';
import { snippets68 } from './snippets68';
import { snippets72 } from './snippets72';
import { snippets75 } from './snippets75';
import { snippets79 } from './snippets79';


// CONSTANTS //

const EXTENSION_NAME = 'fbaligand.vscode-logstash-editor';
const LOGSTASH_VERSION_CONFIG_NAME = 'logstash.version';


// INSTANCE VARIABLES //

const extension = vscode.extensions.getExtension(EXTENSION_NAME);
const logstashVersionConfig = extension && extension.packageJSON.contributes.configuration[0].properties[LOGSTASH_VERSION_CONFIG_NAME];

const snippetsByVersion: Record<string, Record<string, vscode.CompletionItem[]>> = {
	'6.8': snippets68,
	'7.2': snippets72,
	'7.5': snippets75,
	'7.9': snippets79
};

/** Current snippets base, for configured Logstash version */
let snippetsBase: Record<string, vscode.CompletionItem[]>;


// PRIVATE METHODS //

/** Get and return configured Logstash version */
function getLogstashVersion() {
	return  vscode.workspace.getConfiguration().get(LOGSTASH_VERSION_CONFIG_NAME, logstashVersionConfig.default);
}

// EXPORTS //

export const SET_LOGSTASH_VERSION_COMMAND_NAME = 'config.commands.setLogstashVersion';

/** Command that opens a picker to change Logstash version */
export async function setLogstashVersionCommandCallback() {

	const previousValue = getLogstashVersion();

	const value = await vscode.window.showQuickPick(logstashVersionConfig.enum, {placeHolder: 'Current: ' + previousValue});

	if (value) {
		await vscode.workspace.getConfiguration().update(LOGSTASH_VERSION_CONFIG_NAME, value, vscode.ConfigurationTarget.Global);
		snippetsBase = snippetsByVersion[value];
	}
}

/** Get and return current snippets base, for configured Logstash version */
export function getSnippets(): Record<string, vscode.CompletionItem[]> {
	if (!snippetsBase) {
		snippetsBase = snippetsByVersion[getLogstashVersion()];
	}
	return snippetsBase;
}