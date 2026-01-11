import * as vscode from 'vscode';
import { snippets68 } from './snippets68';
import { snippets717 } from './snippets717';
import { snippets814 } from './snippets814';
import { snippets819 } from './snippets819';


// CONSTANTS //

const EXTENSION_NAME = 'fbaligand.vscode-logstash-editor';
const LOGSTASH_VERSION_CONFIG_NAME = 'logstash.version';


// INSTANCE VARIABLES //

const extension = vscode.extensions.getExtension(EXTENSION_NAME);
const logstashVersionConfig = extension && extension.packageJSON.contributes.configuration[0].properties[LOGSTASH_VERSION_CONFIG_NAME];

const snippetsByVersion: Record<string, Record<string, vscode.CompletionItem[]>> = {
	'6.8': snippets68,
	'7.17': snippets717,
	'8.14': snippets814,
	'8.19': snippets819
};

/** Current snippets base, for configured Logstash version */
let snippetsBase: Record<string, vscode.CompletionItem[]>;


// PRIVATE METHODS //

/** Get and return configured Logstash version */
function getLogstashVersion() {
	const version = vscode.workspace.getConfiguration().get(LOGSTASH_VERSION_CONFIG_NAME, logstashVersionConfig.default);
	if (version !== '7.17' && version.startsWith('7')) {
		return '7.17';
	}
	else if (version === 'latest') {
		return '8.19';
	}
	else {
		return version;
	}
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