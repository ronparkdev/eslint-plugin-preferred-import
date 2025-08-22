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

type MappingPath = {
  absoluteSrcPath: string
  distPath: string
  isExactMatch: boolean
}

export default createRule<Options, MessageIds>({
  name: 'js-imports',
  meta: {
    docs: {
      description: 'Check for replaceable to absolute paths',
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
    const { resolveAlias: resolveAliasMap, ignoreCurrentDirectoryImport } = options || {}

    const mappingPaths: MappingPath[] = Object.keys(resolveAliasMap).map((distPath) => {
      const isExactMatch = distPath.endsWith('$')
      return {
        absoluteSrcPath: resolveAliasMap[distPath],
        distPath: isExactMatch ? distPath.slice(0, -1) : distPath,
        isExactMatch,
      }
    })

    return {
      ImportDeclaration(node): void {
        const { source } = node

        const matchResult = /^(["'])(.*)(\1)$/g.exec(source?.raw?.trim() || '')
        if (!matchResult) {
          return
        }

        const [_, quote, importPath] = matchResult

        if (!importPath.split(path.sep).find((subPath) => ['.', '..'].includes(subPath))) {
          return
        }

        if (ignoreCurrentDirectoryImport && importPath.startsWith('./')) {
          return
        }

        const lintingFilePath = getLintingFilePath(context)
        const lintingDirectoryPath = path.dirname(lintingFilePath)
        const absoluteImportPath = path.resolve(lintingDirectoryPath, importPath)

        const resolveAlias = mappingPaths.find(({ absoluteSrcPath, isExactMatch }) =>
          isExactMatch
            ? absoluteImportPath.toLowerCase() === absoluteSrcPath.toLowerCase()
            : absoluteImportPath.toLowerCase().startsWith(absoluteSrcPath.toLowerCase()),
        )

        if (!resolveAlias) {
          return
        }

        const fixedFilePath = `${resolveAlias.distPath}${absoluteImportPath.slice(resolveAlias.absoluteSrcPath.length)}`

        if (fixedFilePath !== importPath) {
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
