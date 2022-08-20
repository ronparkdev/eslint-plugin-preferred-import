import path from 'path'

import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'

import rule from '../../src/rules/js-imports'
import { getOptionsInjectedRule } from '../utils/rule'

const { RuleTester } = ESLintUtils

const getFilename = (filePath: string): string => path.resolve('./tests/simple', filePath)

const ruleTester = new RuleTester({ parser: '@typescript-eslint/parser' })

const injectedRule = getOptionsInjectedRule(rule, [
  {
    resolveAlias: {
      standalone$: path.resolve(__dirname, 'standalone'),
      util: path.resolve(__dirname, 'util'),
    },
    ignoreCurrentDirectoryImport: false,
  },
])

ruleTester.run('js-imports', injectedRule, {
  valid: [
    {
      code: `import { Standalone as StandaloneB } from './standalone/test'`,
      filename: getFilename('main.ts'),
    },
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
          messageId: 'hasPreferredImport',
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
          messageId: 'hasPreferredImport',
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
          messageId: 'hasPreferredImport',
          data: { filePath: 'util/one' },
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      output: `import { OneUtil } from 'util/one'`,
      filename: getFilename('service/one.ts'),
    },
  ],
})
