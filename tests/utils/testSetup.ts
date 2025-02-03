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
    const type = (() => {
      if (code.includes('import ')) {
        return AST_NODE_TYPES.ImportDeclaration
      }

      if (code.includes('export ')) {
        return AST_NODE_TYPES.ExportNamedDeclaration
      }

      throw new Error('Invalid code')
    })()

    testCase.errors = [
      {
        messageId,
        type,
        data: { filePath: fixedCode.match(/from ['"](.+)['"]/)[1] },
      },
    ]
    testCase.output = fixedCode
  }

  return testCase
}
