import * as vscode from 'vscode';

import { getSnippets } from './snippets/snippetsProvider';

/**
 * CONSTANTS 
 */
const PARENT_REGEX = /^\s*((codec\s*=>\s*)?\w+)\s*\{/;
const CODEC_PARENT_REGEX = /^\s*codec\s*=>\s*\w*/;
const COMPLETION_AVAILABLE_PREFIX_REGEX = /^\s*(codec\s*=>\s*)?\w*$/;
const LAST_TOKEN_REGEX = /^.*\b(\w+)$/;
const FRAGMENTS_TO_IGNORE_REGEX = /"[^"]*"|'[^']*'|#.*$/g;
const QUOTE_BLOCK_START_REGEX = /=>\s*('[^']*|"[^"]*)$/;
const QUOTE_BLOCK_END_REGEX = /([^']*'|[^"]*")\s*$/;
const OPEN_PARENTHESIS_REGEX = /\{/g;
const CLOSED_PARENTHESIS_REGEX = /\}/g;

/**
 * INTERNAL CLASSES AND INTERFACES
 */

/** error raised when no completion is available */
class NoCompletionError extends Error {
}

/** result data containing information about the Logstash parent, relative to current cursor position */
interface LogstashParent {
	label: string;
	lineNumber: number;
}

/** information about the Logstash context, relative to current cursor position */
interface LogstashContext {
	section?: string;
	plugin?: string;
}

/**
 * Retrieve and return the Logstash parent (and its position), relative to current cursor position.
 * Returns `undefined` if no parent found.
 */
function getLogstashParent(document: vscode.TextDocument, currentLineNumber: number, currentLinePrefix?: string): LogstashParent | undefined {

	// case where current line is a 'codec' definition
	if (currentLinePrefix && currentLinePrefix.match(CODEC_PARENT_REGEX)) {
		return { label: 'codec', lineNumber: currentLineNumber };
	}

	// search parent in previous lines
	let lineNumber = currentLineNumber - 1;
	let line: string;
	let parenthesisCount = 0;
	let inQuoteBlock = false;
	
	while (lineNumber >= 0) {

		// ignore comments or quote fragments
		line = document.lineAt(lineNumber).text.replace(FRAGMENTS_TO_IGNORE_REGEX, '');

		// check if quote block start (to stop to ignore quote block)
		if (line.match(QUOTE_BLOCK_START_REGEX)) {
			// reset flag to indicate that quote block is ended
			if (inQuoteBlock) {
				inQuoteBlock = false;
				lineNumber--;
				continue;
			}
			// current line is in a quote block => no completion
			else {
				throw new NoCompletionError();
			}
		}

		// check if quote block end
		if (line.match(QUOTE_BLOCK_END_REGEX)) {
			// set flag to ignore quote block
			inQuoteBlock = true;
		}

		// ignore quote block
		if (inQuoteBlock) {
			lineNumber--;
			continue;
		}

		// count open/closed parenthesis
		const openParenthesisFound = line.match(OPEN_PARENTHESIS_REGEX);
		if (openParenthesisFound) {
			parenthesisCount += openParenthesisFound.length;
		}
		const closedParenthesisFound = line.match(CLOSED_PARENTHESIS_REGEX);
		if (closedParenthesisFound) {
			parenthesisCount -= closedParenthesisFound.length;
		}

		// check if line contains parent?
		if (parenthesisCount > 0) {
			if (line.match(PARENT_REGEX)) {
				const label = line.replace(PARENT_REGEX, '$1').trim();
				if (label !== 'else') {
					return { label, lineNumber };
				}
			}
			parenthesisCount = 0;
		}

		// go to previous line
		lineNumber--;
	}

	return undefined;
}

/**
 * Retrieve and return the Logstash context (current section & plugin), relative to current cursor position.
 */
function getLogstashContext(document: vscode.TextDocument, currentLineNumber: number, currentLinePrefix?: string): LogstashContext {
	const parent = getLogstashParent(document, currentLineNumber, currentLinePrefix);

	// parent is 'codec/plugin' 
	if (parent && parent.label.includes('=>')) {
		return { section: 'codec', plugin: parent.label.replace(LAST_TOKEN_REGEX, '$1') };
	}

	// parent is a plugin (not a section)
	let grandParent;
	if (parent && !['input', 'filter', 'output', 'codec'].includes(parent.label)) {
		grandParent = getLogstashParent(document, parent.lineNumber);
	}

	// parent is a section
	if (parent && !grandParent) {
		return { section: parent.label };
	}
	// parent is a plugin
	else if (parent && grandParent) {
		return { section: grandParent.label, plugin: parent.label };
	}
	// there is no parent
	else {
		return {  };
	}
}

/**
 * compute and return the key (in snippets) matching `logstashContext`
 */
function getSnippetsKey(logstashContext: LogstashContext): string {
	if (!logstashContext.section) {
		return 'logstash-root';
	}
	else if (logstashContext.section && !logstashContext.plugin) {
		return `logstash-${logstashContext.section}`;
	}
	else {
		return `logstash-${logstashContext.section}-${logstashContext.plugin}`;
	}
}

/**
 * create return a 'No suggestions' item list, when no completion is available
 */
function getNoSuggestionCompletionItems(): vscode.CompletionItem[] {
	const noSuggestionCompletionItem = new vscode.CompletionItem('No suggestions.');
	noSuggestionCompletionItem.insertText = '';
	noSuggestionCompletionItem.filterText = '';
	return [ noSuggestionCompletionItem ];
}

/**
 * CompletionItemProvider providing completion items for Logstash language, depending cursor position
 */
export const logstashCompletionItemProvider: vscode.CompletionItemProvider = {

	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.CompletionItem[] {

		// check if current line has completion available
		const currentLinePrefix = document.lineAt(position).text.substr(0, position.character);
		if (!currentLinePrefix.match(COMPLETION_AVAILABLE_PREFIX_REGEX)) {
			return getNoSuggestionCompletionItems();
		}

		try {
			// get Logstash context (current section and plugin)
			const logstashContext = getLogstashContext(document, position.line, currentLinePrefix);

			// build snippets list to return
			const allSnippets = new Array<vscode.CompletionItem>();

			// first add initial root/section/plugin snippets
			const initialSnippets = getSnippets()[getSnippetsKey(logstashContext)];
			if (initialSnippets) {
				allSnippets.push(...initialSnippets);
			}

			// case where Logstash context is unknown (unknown plugin for example)
			if (!initialSnippets) {
				return getNoSuggestionCompletionItems();
			}

			// add plugin common options
			if (logstashContext.plugin) {
				const commonOptions = getSnippets()[`logstash-${logstashContext.section}-common_options`];
				if (commonOptions) {
					allSnippets.push(...commonOptions);
				}
			}

			// return all snippets for completion
			if (allSnippets.length > 0) {
				return allSnippets;
			}
			else {
				return getNoSuggestionCompletionItems();
			}
		}
		catch (error) {
			if(error instanceof NoCompletionError) {
				return getNoSuggestionCompletionItems();
			}
			else {
				console.log(error);
				throw error;
			}
		}
	}
};

/**
 * HoverProvider providing documentation when hover over a logstash token (section, plugin, option)
 */
export const logstashHoverProvider: vscode.HoverProvider = {
	provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {

		// get current Logstash item (if any)
		const logstashCurrentItemRange = document.getWordRangeAtPosition(position, /\w+/);
		if (!logstashCurrentItemRange) {
			return undefined;
		}
		const logstashCurrentItem = document.getText(logstashCurrentItemRange);

		// get completion items given current position
		const completionContext: vscode.CompletionContext = { triggerKind: vscode.CompletionTriggerKind.Invoke };
		const completionItems = logstashCompletionItemProvider.provideCompletionItems(document, position, token, completionContext);

		// find the completion item where cursor is present (if any)
		const foundCompletionItem = (<vscode.CompletionItem[]>completionItems).find(completionItem => completionItem.filterText === logstashCurrentItem);
		if (!foundCompletionItem || !foundCompletionItem.documentation) {
			return undefined;
		}

		// return hover information on current position item
		return new vscode.Hover(foundCompletionItem.documentation, logstashCurrentItemRange);
	}
};