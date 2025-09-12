import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default [
	js.configs.recommended,
	importPlugin.flatConfigs.recommended,
	jsdoc.configs['flat/recommended'],
	{
		plugins: {
			jsdoc,
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports,
		},
		files: ['**/*.{js,mjs,cjs}'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},

			ecmaVersion: 'latest',
			sourceType: 'module',
		},

		settings: {
			'import/resolver': 'node',
		},

		rules: {
			indent: ['error', 'tab'],
			semi: ['error', 'always'],
			quotes: ['error', 'single'],
			'no-unused-vars': 'off',
			'import/first': 1,
			'import/no-unresolved': 0,
			'import/newline-after-import': 1,
			'simple-import-sort/imports': 1,
			'simple-import-sort/exports': 1,

			'spaced-comment': [1, 'always', {
				markers: ['/'],
			}],

			'jsdoc/no-multi-asterisks': [1, {
				allowWhitespace: true,
			}],

			'jsdoc/require-jsdoc': 0,
			'jsdoc/require-param': 0,
			'jsdoc/require-param-description': 0,
			'jsdoc/require-param-name': 1,
			'jsdoc/require-property-description': 0,
			'jsdoc/require-returns-description': 0,
			'jsdoc/require-hyphen-before-param-description': 1,
			'unused-imports/no-unused-imports': 'error',

			'unused-imports/no-unused-vars': ['warn', {
				vars: 'all',
				varsIgnorePattern: '^_',
				args: 'after-used',
				argsIgnorePattern: '^_',
			}],
		},
	}];