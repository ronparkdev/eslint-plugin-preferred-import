import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import preferredImport from './dist/index.js';

export default [
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
        project: ['./tsconfig.json', './tsconfig.build.json'],
      },
      globals: {
        browser: true,
        es2021: true,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      import: importPlugin,
      prettier: prettierPlugin,
      'preferred-import': preferredImport,
    },
    rules: {
      'require-jsdoc': 'off',
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: ['builtin', 'external', 'internal', 'unknown', ['parent', 'sibling', 'index']],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
      'no-unused-vars': 'off',
      'preferred-import/ts-imports': 'error',
      'preferred-import/js-imports': 'error',
    },
  },
  {
    ignores: ['dist/**/*'],
  },
];