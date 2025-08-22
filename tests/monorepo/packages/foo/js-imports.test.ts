import path from 'path'

import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../../../src/rules/js-imports'
import { getOptionsInjectedRule } from '../../../utils/rule'

const getFilename = (filePath: string): string => path.resolve('./tests/monorepo/packages/bar', filePath)

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
  },
})

const injectedRule = getOptionsInjectedRule(rule, [
  {
    resolveAlias: {
      service: path.resolve(__dirname, 'service'),
      util: path.resolve(__dirname, 'util'),
    },
    ignoreCurrentDirectoryImport: false,
  },
])

ruleTester.run('js-imports', injectedRule, {
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
