import path from 'path'

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'

const { RuleTester } = ESLintUtils

import rule from '../../src/rules/no-relative-path-imports'

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

ruleTester.run('no-relative-path-imports - simple', rule, {
  valid: [
    {
      code: `import { Standalone as StandaloneD } from 'standalone'`,
      filename: getFilename('main.ts'),
    },
  ],
  invalid: [
    {
      code: `import { Standalone as StandaloneB } from './standalone'`,
      errors: [
        {
          messageId: 'hasRelativePathImport',
          data: { filePath: 'standalone' },
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      output: `import { Standalone as StandaloneB } from 'standalone'`,
      filename: getFilename('main.ts'),
    },
    {
      code: `import { Standalone as StandaloneC } from "./standalone"`,
      errors: [
        {
          messageId: 'hasRelativePathImport',
          data: { filePath: 'standalone' },
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      output: `import { Standalone as StandaloneC } from "standalone"`,
      filename: getFilename('main.ts'),
    },
    {
      code: `import { OneUtil } from '../util/one'`,
      errors: [
        {
          messageId: 'hasRelativePathImport',
          data: { filePath: 'util/one' },
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      output: `import { OneUtil } from 'util/one'`,
      filename: getFilename('service/one.ts'),
    },
  ],
})
