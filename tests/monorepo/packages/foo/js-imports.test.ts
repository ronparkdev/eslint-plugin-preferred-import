import path from 'path'

import rule from '../../../../src/rules/js-imports'
import { getOptionsInjectedRule } from '../../../utils/rule'
import { createRuleTester, createTSTestCase } from '../../../utils/testSetup'

const getFilename = (filePath: string): string => path.resolve('./tests/monorepo/packages/bar', filePath)

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

jsRuleTester.run('js-imports', jsInjectedRule, {
  valid: [
    createTSTestCase(`import { Service } from 'service'`, 'hasPreferredImport', getFilename('main.ts')),
    createTSTestCase(`import { OneUtil } from 'util/one'`, 'hasPreferredImport', getFilename('service/one.ts')),
  ],
  invalid: [],
})
