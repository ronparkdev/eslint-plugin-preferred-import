import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'
import path from 'path'

const { RuleTester } = ESLintUtils

import rule, { MessageId } from '../../../../src/rules/prefer-ts-paths-imports'

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

ruleTester.run('prefer-ts-paths-imports - monorepo wrong case', rule, {
  valid: [],
  invalid: [
    {
      code: `import { Service as FooService } from '../foo/service'`,
      errors: [
        {
          messageId: MessageId.HAS_TS_PATHS_IMPORT,
          data: { filePath: '@foo/service' },
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      output: `import { Service as FooService } from '@foo/service'`,
      filename: getFilename('main.ts'),
    },
    {
      code: `import { Service as ShareService } from '../share/service'`,
      errors: [
        {
          messageId: MessageId.HAS_TS_PATHS_IMPORT,
          data: { filePath: '@share/service' },
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      output: `import { Service as ShareService } from '@share/service'`,
      filename: getFilename('main.ts'),
    },
  ],
})
