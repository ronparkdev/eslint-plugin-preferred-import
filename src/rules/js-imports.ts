import path from 'path'

import { createRule } from '../utils/createRule'
import { getLintingFilePath } from '../utils/path'

type Options = [
  {
    resolveAlias?: { [key in string]: string }
    ignoreCurrentDirectoryImport?: boolean
  },
]

type MessageIds = 'hasPreferredImport'

export default createRule<Options, MessageIds>({
  name: 'js-imports',
  meta: {
    docs: {
      description: 'Check for replaceable to absolute paths',
      recommended: 'error',
      suggestion: true,
    },
    fixable: 'code',
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: {
          resolveAlias: {
            description: 'Alias for path',
            type: 'object',
            default: {},
          },
          ignoreCurrentDirectoryImport: {
            description: 'Ignore lint for import of current folder reference (`./`)',
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      hasPreferredImport: `has preferred import '{{filePath}}'`,
    },
  },
  defaultOptions: [
    {
      resolveAlias: {},
      ignoreCurrentDirectoryImport: true,
    },
  ],
  create(context, [options]) {
    const { resolveAlias: rawResolveAlias, ignoreCurrentDirectoryImport } = options || {}

    const resolveAlias: { [key: string]: { path: string; isExactMatch: boolean } } = Object.keys(
      rawResolveAlias,
    ).reduce(
      (map, key) => ({
        ...map,
        [rawResolveAlias[key]]: key.endsWith('$')
          ? { path: key.slice(0, key.length - 1), isExactMatch: true }
          : { path: key, isExactMatch: false },
      }),
      {},
    )

    const getFixedFilePath = (filePath: string): string => {
      const key = Object.keys(resolveAlias).find((key) =>
        resolveAlias[key].isExactMatch
          ? filePath.toLowerCase() === key.toLowerCase()
          : filePath.toLowerCase().startsWith(key.toLowerCase()),
      )

      if (!key) {
        return null
      }

      const { path } = resolveAlias[key]

      return `${path}${filePath.slice(key.length)}`
    }

    return {
      ImportDeclaration(node): void {
        const { source } = node

        const matchResult = /^(["'])(.*)(\1)$/g.exec(source?.raw?.trim() || '')
        if (!matchResult) {
          return
        }

        const [_, quote, importPath] = matchResult

        if (ignoreCurrentDirectoryImport && importPath.startsWith('./')) {
          return
        }

        const lintingFilePath = getLintingFilePath(context)
        const lintingDirectoryPath = path.dirname(lintingFilePath)
        const absoluteImportPath = path.resolve(lintingDirectoryPath, importPath)

        const fixedFilePath = getFixedFilePath(absoluteImportPath)

        if (!!fixedFilePath && fixedFilePath !== importPath) {
          context.report({
            node,
            data: { filePath: fixedFilePath },
            messageId: 'hasPreferredImport',
            fix(fixer) {
              return fixer.replaceText(source, `${quote}${fixedFilePath}${quote}`)
            },
          })
        }
      },
    }
  },
})
