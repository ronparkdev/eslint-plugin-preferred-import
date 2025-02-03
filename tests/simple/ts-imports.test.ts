import path from 'path'

import rule from '../../src/rules/ts-imports'
import { getOptionsInjectedRule } from '../utils/rule'
import { createTSRuleTester, createTSTestCase, getTestFilePath } from '../utils/testSetup'

const BASE_PATH = './tests/simple'
const getFilename = (filePath: string): string => getTestFilePath(BASE_PATH, filePath)

const ruleTester = createTSRuleTester(getFilename('tsconfig.json'))

const injectedRule = getOptionsInjectedRule(rule, [
  {
    ignoreCurrentDirectoryImport: false,
  },
])

ruleTester.run('ts-imports - simple', injectedRule, {
  valid: [
    createTSTestCase(`import { Foo } from '@share/foo'`, 'hasTsPathsImport', getFilename('main.ts')),
    createTSTestCase(
      `import { Standalone as StandaloneA } from '@standalone'`,
      'hasTsPathsImport',
      getFilename('main.ts'),
    ),
  ],
  invalid: [
    createTSTestCase(
      `import { Bar } from 'share/bar'`,
      'hasTsPathsImport',
      getFilename('main.ts'),
      `import { Bar } from '@share/bar'`,
    ),
    createTSTestCase(
      `import { Standalone as StandaloneB } from './standalone'`,
      'hasTsPathsImport',
      getFilename('main.ts'),
      `import { Standalone as StandaloneB } from '@standalone'`,
    ),
    createTSTestCase(
      `export { Bar } from './share/bar'`,
      'hasTsPathsImport',
      getFilename('main.ts'),
      `export { Bar } from '@share/bar'`,
    ),
  ],
})
