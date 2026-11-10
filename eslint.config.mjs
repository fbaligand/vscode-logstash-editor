import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
	{
		ignores: [
			'node_modules/**',
			'out/**',
			'dist/**'
		]
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['src/**/*.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				projectService: true
			},
			globals: {
				...globals.node,
				...globals.browser
			}
		},
		plugins: {
			'@typescript-eslint': tsPlugin
		},
		rules: {
			semi: ['error', 'always'],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-non-null-assertion': 'error',
			'@typescript-eslint/no-unused-expressions': 'error',
			curly: 'error',
			eqeqeq: 'error',
			indent: ['error', 'tab'],
			'linebreak-style': ['error', 'unix'],
			quotes: ['error', 'single'],
			'no-trailing-spaces': ['error', { skipBlankLines: false }],
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-deprecated': 'warn'
		}
	}
];
