import path from 'path'

import { ESLintUtils } from '@typescript-eslint/utils'

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

type Options = [{ ignoreCurrentDirectoryImport?: boolean }]
type MessageIds = 'hasTsPathsImport'

const TARGET_PATH_POSTFIXES = ['.tsx', '.ts', '/index.tsx', '/index.ts', '.js', '/index.js']

export default createRule<Options, MessageIds>({
  name: 'ts-imports',
  meta: {
    docs: {
      description: 'Check for replaceable imports defined in paths of tsconfig.json',
      recommended: 'error',
      suggestion: true,
    },
    fixable: 'code',
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: {
          ignoreCurrentDirectoryImport: {
            description: 'Ignore lint for import of current folder reference (`./`)',
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      hasTsPathsImport: `has replaceable import '{{filePath}}'`,
    },
  },
  defaultOptions: [{ ignoreCurrentDirectoryImport: true }],
  create(context, [options]) {
    const { ignoreCurrentDirectoryImport } = options || {}
    const { program } = ESLintUtils.getParserServices(context)
    const compilerOptions = program.getCompilerOptions()
    const currentDirectory = program.getCurrentDirectory()
    const { paths = {}, baseUrl = currentDirectory } = compilerOptions

    const mappingPaths: MappingPath[] = createMappingPaths(paths, baseUrl)

    return {
      ImportDeclaration(node) {
        const importContext = parseImportDeclaration(node)
        if (!importContext) return

        const { quote, importPath } = importContext

        const filePath = getLintingFilePath(context)
        const directoryPath = path.dirname(filePath)

        const isRelativeImport = importPath.startsWith('.') || importPath.startsWith('..')
        if (isRelativeImport && ignoreCurrentDirectoryImport && importPath.startsWith('./')) return

        const absoluteImportPath = path.resolve(isRelativeImport ? directoryPath : baseUrl, importPath)

        if (isExternalLibrary(program, absoluteImportPath)) return

        const matchingPath = findMatchingPath(absoluteImportPath, mappingPaths)
        if (!matchingPath) return

        const fixedFilePath = getFixedFilePath(absoluteImportPath, matchingPath)
        if (fixedFilePath === importPath) return

        context.report({
          node,
          messageId: 'hasTsPathsImport',
          data: { filePath: fixedFilePath },
          fix: createImportFixer(node, quote, fixedFilePath),
        })
      },
      ExportNamedDeclaration(node) {
        if (!node.source) return

        const importContext = parseImportDeclaration(node)
        if (!importContext) return

        const { quote, importPath } = importContext

        const filePath = getLintingFilePath(context)
        const directoryPath = path.dirname(filePath)

        const isRelativeImport = importPath.startsWith('.') || importPath.startsWith('..')
        if (isRelativeImport && ignoreCurrentDirectoryImport && importPath.startsWith('./')) return

        const absoluteImportPath = path.resolve(isRelativeImport ? directoryPath : baseUrl, importPath)

        if (isExternalLibrary(program, absoluteImportPath)) return

        const matchingPath = findMatchingPath(absoluteImportPath, mappingPaths)
        if (!matchingPath) return

        const fixedFilePath = getFixedFilePath(absoluteImportPath, matchingPath)
        if (fixedFilePath === importPath) return

        context.report({
          node,
          messageId: 'hasTsPathsImport',
          data: { filePath: fixedFilePath },
          fix: createImportFixer(node, quote, fixedFilePath),
        })
      },
    }
  },
})

function createMappingPaths(paths: Record<string, string[]>, baseUrl: string): MappingPath[] {
  return Object.entries(paths).flatMap(([distPath, srcPaths]) =>
    srcPaths.map((srcPath) => {
      const isWildcard = srcPath.endsWith('/*') && distPath.endsWith('/*')
      return {
        absoluteSrcPath: path.resolve(baseUrl, isWildcard ? srcPath.slice(0, -2) : srcPath),
        distPath: isWildcard ? distPath.slice(0, -2) : distPath,
        isExactMatch: !isWildcard,
      }
    }),
  )
}

function isExternalLibrary(program: any, absoluteImportPath: string): boolean {
  return TARGET_PATH_POSTFIXES.map((postfix) => `${absoluteImportPath}${postfix}`)
    .map(program.getSourceFile)
    .filter(Boolean)
    .some(
      (sourceFile) =>
        program.isSourceFileDefaultLibrary(sourceFile) || program.isSourceFileFromExternalLibrary(sourceFile),
    )
}
