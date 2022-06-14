import { ESLintUtils } from '@typescript-eslint/utils'

import path from 'path'
import { getLintingFilePath, getSepSuffixedFolderPath } from '../utils/path'

type MappingPathMap = {
  [absoluteSrcPath: string]: {
    distPath: string
    prefixed: boolean
  }
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
    schema: [],
    messages: {
      [MessageId.HAS_RELATIVE_PATH_IMPORT]: `has relative path import '{{filePath}}'`,
    },
  },
  create(context) {
    const { program } = ESLintUtils.getParserServices(context)

    const compilerOptions = program.getCompilerOptions()
    const currentDirectory = program.getCurrentDirectory()

    const { paths = {}, baseUrl = currentDirectory } = compilerOptions

    const sepSuffixedBaseUrl = getSepSuffixedFolderPath(baseUrl)

    // Get replace path map for replacing from absolute path to short path
    const pathMap: MappingPathMap = {}

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

        const isRelativePath = !!importPath.split(path.sep).find((subPath) => ['.', '..'].includes(subPath))
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
