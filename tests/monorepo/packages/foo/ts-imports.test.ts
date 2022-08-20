import path from 'path'

import { ESLintUtils } from '@typescript-eslint/utils'

import rule from '../../../../src/rules/ts-imports'
import { getOptionsInjectedRule } from '../../../utils/rule'

const { RuleTester } = ESLintUtils

const getFilename = (filePath: string): string => path.resolve('./tests/monorepo/packages/foo', filePath)

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

ruleTester.run('ts-imports - monorepo correct case', injectedRule, {
  valid: [
    {
      code: `import { Service as FooService } from '@foo/service'`,
      filename: getFilename('main.ts'),
    },
    {
      code: `import { Service } from 'service'`,
      filename: getFilename('main.ts'),
    },
    {
      code: `import { Service as ShareService } from '@share/service'`,
      filename: getFilename('main.ts'),
    },
  ],
  invalid: [],
})
