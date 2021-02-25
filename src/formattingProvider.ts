import * as vscode from 'vscode';

// CONSTANTS //
const TABS_REGEX = /\t/g;
const ESCAPED_DELIMITER_REGEX = /\\["'/]/g;
const DOUBLE_QUOTED_STRING_REGEX = /"([^"]*)"/g;
const SINGLE_QUOTED_STRING_REGEX = /'([^']*)'/g;
const REGULAR_EXPRESSION_REGEX = /\/([^/]*)\//g;
const LINE_WITH_ONE_DOUBLE_QUOTE_REGEX = /^[^"]*"[^"]*$/;
const LINE_WITH_ONE_SINGLE_QUOTE_REGEX = /^[^']*'[^']*$/;
const TRAILING_WHITESPACE_REGEX = /\s+$/;
const LEADING_OPEN_CURLY_BRACE_REGEX = /^\s*\{\s*/;
const LINE_WITH_LEADING_CLOSE_CURLY_BRACE_REGEX = /^\s*\}/;
const ALL_OPEN_CURLY_BRACES_REGEX = /\{/g;


/**
 * Generate and return indentation text, given formatting options and indentation count
 */
function generateExpectedIndentationText(options: vscode.FormattingOptions, indentation: number): string {
	const oneIndentationText = (options.insertSpaces) ? ' '.repeat(options.tabSize) : '\t';
	return indentation > 0 ? oneIndentationText.repeat(indentation) : '';
}

/**
 * Compute and return actual indentation count in provided line
 */
function computeIndentationFromLine(options: vscode.FormattingOptions, line: vscode.TextLine): number {
	let actualIndentationText = line.text.substr(0, line.firstNonWhitespaceCharacterIndex);
	const oneIndentationSpaces = ' '.repeat(options.tabSize);
	actualIndentationText = actualIndentationText.replace(TABS_REGEX, oneIndentationSpaces);
	return Math.floor(actualIndentationText.length / options.tabSize);
}

/**
 * Compute and return full text document range from first character to last character
 */
function getFullRange(document: vscode.TextDocument): vscode.Range {
	return new vscode.Range(
		new vscode.Position(0, 0),
		document.lineAt(document.lineCount - 1).range.end
	);
}

/**
 * compute and return obfuscated delimited content
 */
function obfuscateDelimitedContent(contentWithDelimiters: string, delimitedContent: string): string {
	const delimiter = contentWithDelimiters.substring(0, 1);
	return  delimiter + 'x'.repeat(delimitedContent.length) + delimiter;
}

/**
 * create and return a text range that begins and ends on the same line
 */
function createLineRange(lineNumber: number, startIndex: number, endIndex: number): vscode.Range {
	const startPosition = new vscode.Position(lineNumber, startIndex);
	const endPosition = new vscode.Position(lineNumber, endIndex);
	return new vscode.Range(startPosition, endPosition);
}

/**
 * parse a specific text range in a document and return text edits to do so that text is nicely formatted
 */
export const logstashDocumentRangeFormattingEditProvider: vscode.DocumentRangeFormattingEditProvider = {

	provideDocumentRangeFormattingEdits(document: vscode.TextDocument, range: vscode.Range, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {

		// if range end is at line start, remove range last line
		if (range.end.character === 0) {
			return this.provideDocumentRangeFormattingEdits(document, new vscode.Range(range.start, new vscode.Position(range.end.line - 1, document.lineAt(range.end.line - 1).text.length)), options, token);
		}

		// init variables
		const textEdits = new Array<vscode.TextEdit>();
		let inDoubleQuoteBlock = false;
		let inSingleQuoteBlock = false;
		let currentLineNumber = range.start.line;

		// compute initial indentation
		let indentation = 0;
		if (currentLineNumber > 0) {
			indentation = computeIndentationFromLine(options, document.lineAt(currentLineNumber));
		}

		while (currentLineNumber <= range.end.line) {

			// get current line
			const currentLine = document.lineAt(currentLineNumber);
			let currentLineText = currentLine.text;

			// mask quoted strings
			currentLineText = currentLineText.replace(ESCAPED_DELIMITER_REGEX, 'xx');
			currentLineText = currentLineText.replace(DOUBLE_QUOTED_STRING_REGEX, obfuscateDelimitedContent);
			currentLineText = currentLineText.replace(SINGLE_QUOTED_STRING_REGEX, obfuscateDelimitedContent);
			currentLineText = currentLineText.replace(REGULAR_EXPRESSION_REGEX, obfuscateDelimitedContent);

			// remove comment text (if any)
			const firstSharpIndex = currentLineText.indexOf('#');
			if (firstSharpIndex !== -1) {
				currentLineText = currentLineText.substring(0, firstSharpIndex + 1);
			}

			// init closed quote state
			let closeQuoteOnThisLine = false;

			// trailing whitespace: remove it
			const trailingWhitespaceIndex = currentLineText.search(TRAILING_WHITESPACE_REGEX);
			if (trailingWhitespaceIndex > -1) {
				textEdits.push(vscode.TextEdit.delete(createLineRange(currentLineNumber, trailingWhitespaceIndex, currentLineText.length) ));
			}

			// leading close curly brace: decrement indentation
			if (currentLineText.match(LINE_WITH_LEADING_CLOSE_CURLY_BRACE_REGEX) && !inDoubleQuoteBlock && !inSingleQuoteBlock) {
				indentation--;
			}

			// close double quote: decrement indentation
			if (inDoubleQuoteBlock && currentLineText.match(LINE_WITH_ONE_DOUBLE_QUOTE_REGEX)) {
				inDoubleQuoteBlock = false;
				closeQuoteOnThisLine = true;
				indentation--;
			}

			// close single quote: decrement indentation
			if (inSingleQuoteBlock && currentLineText.match(LINE_WITH_ONE_SINGLE_QUOTE_REGEX)) {
				inSingleQuoteBlock = false;
				closeQuoteOnThisLine = true;
				indentation--;
			}

			// indentation should be checked?
			let checkIndentation = !currentLine.isEmptyOrWhitespace;

			// leading open curly brace: move it to previous line
			const leadingOpenCurlyBraceMatch = currentLineText.match(LEADING_OPEN_CURLY_BRACE_REGEX);
			if (!inSingleQuoteBlock && !inDoubleQuoteBlock && leadingOpenCurlyBraceMatch) {
				let previousLineNumber = currentLineNumber - 1;
				while (previousLineNumber >= 0 && document.lineAt(previousLineNumber).isEmptyOrWhitespace) {
					previousLineNumber--;
				}
				if (previousLineNumber >= 0) {
					checkIndentation = false;
					indentation++;
					const previousLine = document.lineAt(previousLineNumber);
					textEdits.push(vscode.TextEdit.replace(new vscode.Range(previousLine.range.end, new vscode.Position(currentLineNumber, leadingOpenCurlyBraceMatch[0].length)), ' {'));
					if (leadingOpenCurlyBraceMatch[0].length !== currentLine.text.length) {
						textEdits.push(vscode.TextEdit.insert(new vscode.Position(currentLineNumber, leadingOpenCurlyBraceMatch[0].length), '\n' + generateExpectedIndentationText(options, indentation)));
					}
				}
			}

			// *** check and reformat indentation (if necessary)
			if (checkIndentation) {
				let expectedIndentationText = generateExpectedIndentationText(options, indentation);
				let actualIndentationText = currentLineText.substring(0, currentLine.firstNonWhitespaceCharacterIndex);
				if (
					(!inDoubleQuoteBlock && !inSingleQuoteBlock && expectedIndentationText !== actualIndentationText)
					|| ((inDoubleQuoteBlock || inSingleQuoteBlock) && !actualIndentationText.startsWith(expectedIndentationText))
				) {
					textEdits.push(vscode.TextEdit.replace(createLineRange(currentLineNumber, 0, currentLine.firstNonWhitespaceCharacterIndex), expectedIndentationText));
				}
			}

			// process every line but lines between block quotes
			if (!inDoubleQuoteBlock && !inSingleQuoteBlock) {

				// ' => ': normalize whitespace before and after
				const setterOperatorRegexp = /\s*=>\s*/g;
				let setterOperatorMatch;
				while ((setterOperatorMatch = setterOperatorRegexp.exec(currentLineText)) !== null) {
					const operatorIndex = currentLineText.indexOf('=>', setterOperatorMatch.index);
					const operatorPrefix = currentLineText.substring(setterOperatorMatch.index, operatorIndex);
					if (operatorPrefix !== ' ') {
						textEdits.push(vscode.TextEdit.replace(createLineRange(currentLineNumber, setterOperatorMatch.index, operatorIndex), ' '));
					}
					const operatorSuffix = currentLineText.substring(operatorIndex + 2, setterOperatorMatch.index + setterOperatorMatch[0].length);
					if (operatorSuffix !== ' ') {
						textEdits.push(vscode.TextEdit.replace(createLineRange(currentLineNumber, operatorIndex + 2, setterOperatorMatch.index + setterOperatorMatch[0].length), ' '));
					}
				}

				// open curly brace: increment indentation + normalize whitespace before + break line just after (if necessary)
				const openCurlyBraceRegexp = /\S\s*\{\s*#?/g;
				let openCurlyBraceMatch;
				while ((openCurlyBraceMatch = openCurlyBraceRegexp.exec(currentLineText)) !== null) {
					indentation++;
					const openCurlyBraceIndex = openCurlyBraceMatch[0].indexOf('{');
					// normalize whitespace before
					if (openCurlyBraceMatch[0].charAt(0) !== '>') {
						const openCurlyBracePatternStart = openCurlyBraceMatch[0].substring(1, openCurlyBraceIndex);
						if (openCurlyBracePatternStart !== ' ') {
							textEdits.push(vscode.TextEdit.replace(createLineRange(currentLineNumber, openCurlyBraceMatch.index + 1, openCurlyBraceMatch.index + openCurlyBraceIndex), ' '));
						}
					}
					// break line just after (if line end is not reached)
					if (openCurlyBraceMatch.index + openCurlyBraceMatch[0].length < currentLineText.length) {
						if (currentLineText.charAt(openCurlyBraceMatch.index + openCurlyBraceMatch[0].length) === '}') {
							indentation--;
						}
						textEdits.push(vscode.TextEdit.replace(createLineRange(currentLineNumber, openCurlyBraceMatch.index + openCurlyBraceIndex, openCurlyBraceMatch.index + openCurlyBraceMatch[0].length), '{\n' + generateExpectedIndentationText(options, indentation)));
					}
				}

				// close curly brace: decrement indentation + break line before and after
				const closeCurlyBraceRegexp = /\s*\}\s*#?/g;
				let closeCurlyBraceMatch;
				while ((closeCurlyBraceMatch = closeCurlyBraceRegexp.exec(currentLineText)) !== null) {
					const closeCurlyBraceIndex = closeCurlyBraceMatch[0].indexOf('}');
					// break line before (if not a leading '}')
					if (closeCurlyBraceMatch.index !== 0 && currentLineText.charAt(closeCurlyBraceMatch.index - 1) !== '{') {
						indentation--;
						textEdits.push(vscode.TextEdit.replace(createLineRange(currentLineNumber, closeCurlyBraceMatch.index, closeCurlyBraceMatch.index + closeCurlyBraceIndex), '\n' + generateExpectedIndentationText(options, indentation)));
					}
					// break line just after (if line end is not reached)
					if (closeCurlyBraceMatch.index + closeCurlyBraceMatch[0].length < currentLineText.length) {
						const indentationOffset = (currentLineText.match(ALL_OPEN_CURLY_BRACES_REGEX) || []).length;
						textEdits.push(vscode.TextEdit.replace(createLineRange(currentLineNumber, closeCurlyBraceMatch.index + closeCurlyBraceIndex, closeCurlyBraceMatch.index + closeCurlyBraceMatch[0].length), '}\n' + generateExpectedIndentationText(options, indentation - indentationOffset)));
					}
				}

			}

			// open double quote: increment indentation
			if (!closeQuoteOnThisLine && currentLineText.match(LINE_WITH_ONE_DOUBLE_QUOTE_REGEX)) {
				inDoubleQuoteBlock = true;
				indentation++;
			}

			// open single quote: increment indentation
			if (!closeQuoteOnThisLine && currentLineText.match(LINE_WITH_ONE_SINGLE_QUOTE_REGEX)) {
				inSingleQuoteBlock = true;
				indentation++;
			}

			// prepare next line
			++currentLineNumber;
		}

		return textEdits;
	}
};

/**
 * parse a whole document and return text edits to do so that text is nicely formatted
 */
export const logstashDocumentFormattingEditProvider: vscode.DocumentFormattingEditProvider = {

	provideDocumentFormattingEdits(document: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TextEdit[]> {
		return logstashDocumentRangeFormattingEditProvider.provideDocumentRangeFormattingEdits(document, getFullRange(document), options, token);
	}
};
