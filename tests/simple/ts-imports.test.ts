import path from 'path'

import { AST_NODE_TYPES } from '@typescript-eslint/utils'
import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/ts-imports'
import { getOptionsInjectedRule } from '../utils/rule'

const getFilename = (filePath: string): string => path.resolve('./tests/simple', filePath)

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2015,
      project: getFilename('tsconfig.json'),
      sourceType: 'module',
    },
  },
})

const injectedRule = getOptionsInjectedRule(rule, [
  {
    ignoreCurrentDirectoryImport: false,
  },
])

ruleTester.run('ts-imports - simple', injectedRule, {
  valid: [
    {
      code: `import { Foo } from '@share/foo'`,
      filename: getFilename('main.ts'),
    },
    {
      code: `import { Standalone as StandaloneA } from '@standalone'`,
      filename: getFilename('main.ts'),
    },
  ],
  invalid: [
    {
      code: `import { Bar } from 'share/bar'`,
      errors: [
        {
          messageId: 'hasTsPathsImport',
          data: { filePath: '@share/bar' },
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      output: `import { Bar } from '@share/bar'`,
      filename: getFilename('main.ts'),
    },
    {
      code: `import { Standalone as StandaloneB } from './standalone'`,
      errors: [
        {
          messageId: 'hasTsPathsImport',
          data: { filePath: '@standalone' },
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      output: `import { Standalone as StandaloneB } from '@standalone'`,
      filename: getFilename('main.ts'),
    },
    {
      code: `import { Standalone as StandaloneB } from "./standalone"`,
      errors: [
        {
          messageId: 'hasTsPathsImport',
          data: { filePath: '@standalone' },
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      output: `import { Standalone as StandaloneB } from "@standalone"`,
      filename: getFilename('main.ts'),
    },
  ],
})
