import js from '@eslint/js';
import globals from 'globals';

import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';

export default tseslint.config(
	{ ignores: ['dist'] },
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			react: react,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			...react.configs.recommended.rules,
			...react.configs['jsx-runtime'].rules,
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					varsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-unused-expressions': [
				'warn',
				{
					allowTernary: true,
				},
			],
			'eol-last': ['warn', 'always'],
			quotes: ['error', 'single'],
			semi: ['error', 'always'],
			eqeqeq: 'error',
			'no-console': 'warn',
			'prefer-arrow-callback': 'error',
			'arrow-parens': ['error', 'as-needed'],
			'jsx-quotes': ['error', 'prefer-single'],
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 0,
			'react/jsx-no-useless-fragment': 'error',
			'react/jsx-pascal-case': 'error',
			'react/destructuring-assignment': ['error', 'always'],
			'no-trailing-spaces': ['error', { ignoreComments: true }],
			'no-multi-spaces': ['error', { ignoreEOLComments: true }],
			'comma-spacing': ['error', { before: false, after: true }],
			'func-call-spacing': ['error', 'never'],
			'key-spacing': ['error', { beforeColon: false }],
			'prefer-const': 'error',
			'no-var': 'error',
			'no-useless-return': 'error',
			'no-unneeded-ternary': 'error',
			'object-curly-spacing': ['error', 'always'],
			'react-hooks/exhaustive-deps': 'off',
		},
	},
);
