import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'
import path from 'path'

const { RuleTester } = ESLintUtils

import rule from '../../src/rules/prefer-ts-paths-imports'

const getFilename = (filePath: string): string => path.resolve('./tests/simple', filePath)

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2015,
    project: getFilename('tsconfig.json'),
    sourceType: 'module',
  },
})

ruleTester.run('prefer-ts-paths-imports - simple', rule, {
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
      code: `import { Bar } from 'share/barUtil'`,
      errors: [
        {
          messageId: 'hasTsPathsImport',
          data: { filePath: '@share/barUtil' },
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      output: `import { Bar } from '@share/barUtil'`,
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
