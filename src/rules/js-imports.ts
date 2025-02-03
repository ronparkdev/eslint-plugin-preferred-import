// src/rules/js-imports.ts
import path from 'path'

import { createRule } from '../utils/createRule'
import {
  MappingPath,
  parseImportDeclaration,
  shouldIgnoreImport,
  findMatchingPath,
  getFixedFilePath,
  createImportFixer,
} from '../utils/importRuleUtils'
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
    const { resolveAlias: resolveAliasMap, ignoreCurrentDirectoryImport } = options || {}

    const mappingPaths: MappingPath[] = Object.entries(resolveAliasMap).map(([distPath, absoluteSrcPath]) => {
      const isExactMatch = distPath.endsWith('$')
      return {
        absoluteSrcPath,
        distPath: isExactMatch ? distPath.slice(0, -1) : distPath,
        isExactMatch,
      }
    })

    return {
      ImportDeclaration(node): void {
        const importContext = parseImportDeclaration(node)
        if (!importContext) return

        const { quote, importPath } = importContext

        if (shouldIgnoreImport(importPath, ignoreCurrentDirectoryImport)) return

        const lintingFilePath = getLintingFilePath(context)
        const lintingDirectoryPath = path.dirname(lintingFilePath)
        const absoluteImportPath = path.resolve(lintingDirectoryPath, importPath)

        const resolveAlias = findMatchingPath(absoluteImportPath, mappingPaths)
        if (!resolveAlias) return

        const fixedFilePath = getFixedFilePath(absoluteImportPath, resolveAlias)

        if (fixedFilePath !== importPath) {
          context.report({
            node,
            data: { filePath: fixedFilePath },
            messageId: 'hasPreferredImport',
            fix: createImportFixer(node, quote, fixedFilePath),
          })
        }
      },
      ExportNamedDeclaration(node): void {
        if (!node.source) return

        const importContext = parseImportDeclaration(node)
        if (!importContext) return

        const { quote, importPath } = importContext

        if (shouldIgnoreImport(importPath, ignoreCurrentDirectoryImport)) return

        const lintingFilePath = getLintingFilePath(context)
        const lintingDirectoryPath = path.dirname(lintingFilePath)
        const absoluteImportPath = path.resolve(lintingDirectoryPath, importPath)

        const resolveAlias = findMatchingPath(absoluteImportPath, mappingPaths)
        if (!resolveAlias) return

        const fixedFilePath = getFixedFilePath(absoluteImportPath, resolveAlias)

        if (fixedFilePath !== importPath) {
          context.report({
            node,
            data: { filePath: fixedFilePath },
            messageId: 'hasPreferredImport',
            fix: createImportFixer(node, quote, fixedFilePath),
          })
        }
      },
    }
  },
})
