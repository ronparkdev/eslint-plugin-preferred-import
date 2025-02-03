import path from 'path'

import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils'

interface RuleTesterConfig {
  parser?: string
  parserOptions?: Record<string, any>
  plugins?: string[]
}

export const createRuleTester = (config: RuleTesterConfig = {}) => {
  return new ESLintUtils.RuleTester({
    parser: '@typescript-eslint/parser',
    ...config,
  })
}

export const createTSRuleTester = (projectPath: string) => {
  return createRuleTester({
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
      ecmaVersion: 2015,
      project: [projectPath],
      sourceType: 'module',
    },
  })
}

export const getTestFilePath = (basePath: string, filePath: string): string => {
  return path.resolve(basePath, filePath)
}

export const createTSTestCase = (code: string, messageId: string, filename: string, fixedCode?: string) => {
  const testCase: any = {
    code,
    filename,
  }

  if (fixedCode) {
    testCase.errors = [
      {
        messageId,
        type: AST_NODE_TYPES.ImportDeclaration,
        data: { filePath: fixedCode.match(/from ['"](.+)['"]/)[1] },
      },
    ]
    testCase.output = fixedCode
  }

  return testCase
}
