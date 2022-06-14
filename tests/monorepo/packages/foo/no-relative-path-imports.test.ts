import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'
import path from 'path'

const { RuleTester } = ESLintUtils

import rule, { MessageId } from '../../../../src/rules/no-relative-path-imports'

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

ruleTester.run('no-relative-path-imports - monorepo wrong case', rule, {
  valid: [
    {
      code: `import { Service } from 'service'`,
      filename: getFilename('main.ts'),
    },
    {
      code: `import { OneUtil } from 'util/one'`,
      filename: getFilename('service/one.ts'),
    },
  ],
  invalid: [],
})
