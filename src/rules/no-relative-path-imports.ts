import path from 'path'

import { ESLintUtils } from '@typescript-eslint/utils'

import { createRule } from '../utils/createRule'
import { getLintingFilePath, getSepSuffixedFolderPath } from '../utils/path'

type Options = [
  {
    allowParentPathImport?: boolean
    allowChildPathImport?: boolean
  },
]

type MessageIds = 'hasRelativePathImport'

export default createRule<Options, MessageIds>({
  name: 'no-relative-path-imports',
  meta: {
    docs: {
      description: 'Disallow relative path imports (../*, ./*)',
      recommended: 'error',
      suggestion: true,
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
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      hasRelativePathImport: `has relative path import '{{filePath}}'`,
    },
  },
  defaultOptions: [
    {
      allowParentPathImport: false,
      allowChildPathImport: false,
    },
  ],
  create(context, [options]) {
    const targetSubPaths = []

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
            messageId: 'hasRelativePathImport',
            fix(fixer) {
              return fixer.replaceText(source, `${quote}${fixedFilePath}${quote}`)
            },
          })
        }
      },
    }
  },
})
