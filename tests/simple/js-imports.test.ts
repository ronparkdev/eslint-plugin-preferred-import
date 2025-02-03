import path from 'path'

import rule from '../../src/rules/js-imports'
import { getOptionsInjectedRule } from '../utils/rule'
import { createRuleTester, createTSTestCase, getTestFilePath } from '../utils/testSetup'

const BASE_PATH = './tests/simple'
const getFilename = (filePath: string): string => getTestFilePath(BASE_PATH, filePath)

const ruleTester = createRuleTester()

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
    createTSTestCase(
      `import { Standalone as StandaloneB } from './standalone/test'`,
      'hasPreferredImport',
      getFilename('main.ts'),
    ),
    createTSTestCase(
      `import { Standalone as StandaloneD } from 'standalone'`,
      'hasPreferredImport',
      getFilename('main.ts'),
    ),
  ],
  invalid: [
    createTSTestCase(
      `import { Standalone as StandaloneB } from './standalone'`,
      'hasPreferredImport',
      getFilename('main.ts'),
      `import { Standalone as StandaloneB } from 'standalone'`,
    ),
    createTSTestCase(
      `import { OneUtil } from '../util/one'`,
      'hasPreferredImport',
      getFilename('service/one.ts'),
      `import { OneUtil } from 'util/one'`,
    ),
  ],
})
