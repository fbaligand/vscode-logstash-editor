import * as vscode from 'vscode';

export function createSnippet(prefix: string, type: string, body: string, description: string, required?: boolean): vscode.CompletionItem {

	// define snippet kind
	let kind: vscode.CompletionItemKind;
	if (type === 'section') {
		kind = vscode.CompletionItemKind.Module;
	}
	else if (type === 'plugin') {
		kind = vscode.CompletionItemKind.Interface;
	}
	else if (type === 'option' && required) {
		kind = vscode.CompletionItemKind.Method;
	}
	else if (type === 'option') {
		kind = vscode.CompletionItemKind.Field;
	}
	else if (type === 'common_option') {
		kind = vscode.CompletionItemKind.Constant;
	}
	else if (type === 'keyword') {
		kind = vscode.CompletionItemKind.Keyword;
	}
	else {
		kind = vscode.CompletionItemKind.Value;
	}

	const snippet = new vscode.CompletionItem(prefix, kind);
	snippet.filterText = prefix;
	snippet.insertText = new vscode.SnippetString(body);
	snippet.documentation = new vscode.MarkdownString(description);

	let sortPrefix = (type === 'common_option') ? '2' : '1';
	sortPrefix += (required) ? '1' : '2';
	snippet.sortText = `${sortPrefix}-${prefix}`;

	return snippet;
}

