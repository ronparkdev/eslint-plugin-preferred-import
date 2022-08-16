import path from 'path'

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'

const { RuleTester } = ESLintUtils

import rule from '../../../../src/rules/js-imports'

const getFilename = (filePath: string): string => path.resolve('./tests/monorepo/packages/bar', filePath)

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2015,
    project: getFilename('tsconfig.json'),
    sourceType: 'module',
  },
})

ruleTester.run('js-imports - monorepo wrong case', rule, {
  valid: [],
  invalid: [
    {
      code: `import { Service } from './service'`,
      errors: [
        {
          messageId: 'hasRelativePathImport',
          data: { filePath: 'service' },
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      output: `import { Service } from 'service'`,
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
