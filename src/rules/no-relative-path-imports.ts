import { ESLintUtils } from '@typescript-eslint/utils'

import path from 'path'
import { getLintingFilePath, getSepSuffixedFolderPath } from '../utils/path'

interface Options {
  allowParentPathImport?: boolean
  allowChildPathImport?: boolean
}

export enum MessageId {
  HAS_RELATIVE_PATH_IMPORT = 'HAS_RELATIVE_PATH_IMPORT',
}

export default {
  meta: {
    docs: {
      description: 'Disallow relative path imports (../*, ./*)',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: {
          allowParentPathImport: {
            description: 'If `false`, will report ../ included imports.',
            type: 'boolean',
            default: false,
          },
          allowChildPathImport: {
            description: 'If `false`, will report ./ included imports.',
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      [MessageId.HAS_RELATIVE_PATH_IMPORT]: `has relative path import '{{filePath}}'`,
    },
  },
  create(context) {
    const options = context.options[0] || {}

    let targetSubPaths = []

    if (options.allowParentPathImport !== true) {
      targetSubPaths.push('..')
    }

    if (options.allowChildPathImport !== true) {
      targetSubPaths.push('.')
    }

    const { program } = ESLintUtils.getParserServices(context)

    const compilerOptions = program.getCompilerOptions()
    const currentDirectory = program.getCurrentDirectory()

    const { baseUrl = currentDirectory } = compilerOptions

    const sepSuffixedBaseUrl = getSepSuffixedFolderPath(baseUrl)

    const getFixedFilePath = (relativeTargetFilePath: string): string => {
      const lintingFilePath = getLintingFilePath(context)
      const lintingFolderPath = path.dirname(lintingFilePath)

      const absoluteTargetFilePath = path.resolve(lintingFolderPath, relativeTargetFilePath)
      if (absoluteTargetFilePath.toLowerCase().startsWith(sepSuffixedBaseUrl.toLocaleLowerCase())) {
        return absoluteTargetFilePath.slice(sepSuffixedBaseUrl.length)
      }

      return null
    }

    return {
      ImportDeclaration(node): void {
        const { source } = node

        const matchResult = /^(["'])(.*)(\1)$/g.exec(source?.raw?.trim() || '')
        if (!matchResult) {
          return
        }

        const [_, quote, importPath] = matchResult

        const isRelativePath = !!importPath.split(path.sep).find((subPath) => targetSubPaths.includes(subPath))
        if (!isRelativePath) {
          return
        }

        const fixedFilePath = getFixedFilePath(importPath)

        if (!!fixedFilePath && fixedFilePath !== importPath) {
          context.report({
            node,
            data: { filePath: fixedFilePath },
            messageId: MessageId.HAS_RELATIVE_PATH_IMPORT,
            fix(fixer) {
              return fixer.replaceText(source, `${quote}${fixedFilePath}${quote}`)
            },
          })
        }
      },
    }
  },
} as const
