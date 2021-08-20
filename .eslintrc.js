/**@type {import('eslint').Linter.Config} */
// eslint-disable-next-line no-undef
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		'semi': ['error', 'always'],
		'@typescript-eslint/no-explicit-any': 'error',
		'@typescript-eslint/no-non-null-assertion': 'error',
		'@typescript-eslint/no-unused-expressions': 'error',
		'curly': 'error',
		'eqeqeq': 'error',
		'indent': [ 'error', 'tab' ],
		'linebreak-style': ['error', 'unix'],
		'quotes': ['error', 'single'],
		'no-trailing-spaces': ['error', { 'skipBlankLines': false }],
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-unused-vars': 'off'
	}
};