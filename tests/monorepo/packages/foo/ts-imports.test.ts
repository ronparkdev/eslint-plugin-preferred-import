import rule from '../../../../src/rules/ts-imports'
import { getOptionsInjectedRule } from '../../../utils/rule'
import { createTSRuleTester, createTSTestCase, getTestFilePath } from '../../../utils/testSetup'

const BASE_PATH = './tests/monorepo/packages/foo'
const getFilename = (filePath: string): string => getTestFilePath(BASE_PATH, filePath)

const ruleTester = createTSRuleTester(getFilename('tsconfig.json'))

const injectedRule = getOptionsInjectedRule(rule, [
  {
    ignoreCurrentDirectoryImport: false,
  },
])

ruleTester.run('ts-imports - monorepo correct case', injectedRule, {
  valid: [
    createTSTestCase(
      `import { Service as FooService } from '@foo/service'`,
      'hasTsPathsImport',
      getFilename('main.ts'),
    ),
    createTSTestCase(`import { Service } from 'service'`, 'hasTsPathsImport', getFilename('main.ts')),
    createTSTestCase(
      `import { Service as ShareService } from '@share/service'`,
      'hasTsPathsImport',
      getFilename('main.ts'),
    ),
  ],
  invalid: [],
})
