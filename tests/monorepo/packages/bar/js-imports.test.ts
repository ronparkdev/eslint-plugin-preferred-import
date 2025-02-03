import path from 'path'

import rule from '../../../../src/rules/js-imports'
import { getOptionsInjectedRule } from '../../../utils/rule'
import { createRuleTester, createTSTestCase, getTestFilePath } from '../../../utils/testSetup'

const BASE_PATH = './tests/monorepo/packages/bar'
const getFilename = (filePath: string): string => getTestFilePath(BASE_PATH, filePath)

const jsRuleTester = createRuleTester()

const jsInjectedRule = getOptionsInjectedRule(rule, [
  {
    resolveAlias: {
      service: path.resolve(__dirname, 'service'),
      util: path.resolve(__dirname, 'util'),
    },
    ignoreCurrentDirectoryImport: false,
  },
])

jsRuleTester.run('js-imports - monorepo wrong case', jsInjectedRule, {
  valid: [],
  invalid: [
    createTSTestCase(
      `import { Service } from './service'`,
      'hasPreferredImport',
      getFilename('main.ts'),
      `import { Service } from 'service'`,
    ),
    createTSTestCase(
      `import { OneUtil } from '../util/one'`,
      'hasPreferredImport',
      getFilename('service/one.ts'),
      `import { OneUtil } from 'util/one'`,
    ),
    createTSTestCase(
      `export { OneUtil } from '../util/one'`,
      'hasPreferredImport',
      getFilename('service/one.ts'),
      `export { OneUtil } from 'util/one'`,
    ),
  ],
})
