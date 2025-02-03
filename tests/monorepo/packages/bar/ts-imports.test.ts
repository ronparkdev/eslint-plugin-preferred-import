import path from 'path'

import rule from '../../../../src/rules/ts-imports'
import { getOptionsInjectedRule } from '../../../utils/rule'
import { createTSRuleTester, createTSTestCase } from '../../../utils/testSetup'

const getFilename = (filePath: string): string => path.resolve('./tests/monorepo/packages/bar', filePath)

const ruleTester = createTSRuleTester(getFilename('tsconfig.json'))

const injectedRule = getOptionsInjectedRule(rule, [
  {
    ignoreCurrentDirectoryImport: false,
  },
])

ruleTester.run('ts-imports - monorepo wrong case', injectedRule, {
  valid: [],
  invalid: [
    createTSTestCase(
      `import { Service as FooService } from '../foo/service'`,
      'hasTsPathsImport',
      getFilename('main.ts'),
      `import { Service as FooService } from '@foo/service'`,
    ),
    createTSTestCase(
      `import { Service as ShareService } from '../share/service'`,
      'hasTsPathsImport',
      getFilename('main.ts'),
      `import { Service as ShareService } from '@share/service'`,
    ),
  ],
})
