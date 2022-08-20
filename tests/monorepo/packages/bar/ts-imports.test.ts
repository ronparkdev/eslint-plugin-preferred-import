import path from 'path'

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'

import rule from '../../../../src/rules/ts-imports'
import { getOptionsInjectedRule } from '../../../utils/rule'

const { RuleTester } = ESLintUtils

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

const injectedRule = getOptionsInjectedRule(rule, [
  {
    ignoreCurrentDirectoryImport: false,
  },
])

ruleTester.run('ts-imports - monorepo wrong case', injectedRule, {
  valid: [],
  invalid: [
    {
      code: `import { Service as FooService } from '../foo/service'`,
      errors: [
        {
          messageId: 'hasTsPathsImport',
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
          messageId: 'hasTsPathsImport',
          data: { filePath: '@share/service' },
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      output: `import { Service as ShareService } from '@share/service'`,
      filename: getFilename('main.ts'),
    },
  ],
})
