import path from 'path'

import { ESLintUtils } from '@typescript-eslint/utils'

import { createRule } from '../utils/createRule'
import { getLintingFilePath } from '../utils/path'

type MappingPath = {
  absoluteSrcPath: string
  distPath: string
  isExactMatch: boolean
}

type Options = [
  {
    ignoreCurrentDirectoryImport?: boolean
  },
]

type MessageIds = 'hasTsPathsImport'

const TARGET_PATH_POSTFIXES = ['.tsx', '.ts', '/index.tsx', '/index.ts', '.js', '/index.js']

export default createRule<Options, MessageIds>({
  name: 'ts-imports',
  meta: {
    docs: {
      description: 'Disallow replaceable imports defined in paths of tsconfig.json',
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
  defaultOptions: [
    {
      ignoreCurrentDirectoryImport: true,
    },
  ],
  create(context, [options]) {
    const { ignoreCurrentDirectoryImport } = options || {}
    const { program } = ESLintUtils.getParserServices(context)

    const compilerOptions = program.getCompilerOptions()
    const currentDirectory = program.getCurrentDirectory()

    const { paths = {}, baseUrl = currentDirectory } = compilerOptions

    // Get replace path map for replacing from absolute path to short path
    const mappingPaths: MappingPath[] = Object.keys(paths).flatMap((distPath) => {
      return paths[distPath].map((srcPath) => {
        if (srcPath.endsWith('/*') && distPath.endsWith('/*')) {
          // Applies to all files in that folder
          return {
            absoluteSrcPath: path.resolve(baseUrl, srcPath.slice(0, srcPath.length - 1)),
            distPath: distPath.slice(0, distPath.length - 1),
            isExactMatch: false,
          }
        } else {
          // Apply only this file
          return { absoluteSrcPath: path.resolve(baseUrl, srcPath), distPath, isExactMatch: true }
        }
      })
    })

    return {
      ImportDeclaration(node): void {
        const { source } = node

        const matchResult = /^(["'])(.*)(\1)$/g.exec(source?.raw?.trim() || '')
        if (!matchResult) {
          return
        }

        const [_, quote, importFilePath] = matchResult

        if (ignoreCurrentDirectoryImport && importFilePath.startsWith('./')) {
          return
        }

        const filePath = getLintingFilePath(context)
        const directoryPath = path.dirname(filePath)

        const isRelativeImportFilePath = !!importFilePath
          .split(path.sep)
          .find((subPath) => ['.', '..'].includes(subPath))

        const absoluteImportFilePath = path.resolve(isRelativeImportFilePath ? directoryPath : baseUrl, importFilePath)

        // Ignore if import file is library
        if (
          TARGET_PATH_POSTFIXES.map((postfix) => `${absoluteImportFilePath}${postfix}`)
            .map(program.getSourceFile)
            .filter((sourceFile) => !!sourceFile)
            .filter(
              (sourceFile) =>
                program.isSourceFileDefaultLibrary(sourceFile) || program.isSourceFileFromExternalLibrary(sourceFile),
            )
            .find((sourceFile) => !!sourceFile)
        ) {
          return
        }

        const mappingPath = mappingPaths.find(({ absoluteSrcPath, isExactMatch }) =>
          isExactMatch
            ? absoluteImportFilePath.toLowerCase() === absoluteSrcPath.toLowerCase()
            : absoluteImportFilePath.toLowerCase().startsWith(absoluteSrcPath.toLowerCase()),
        )

        if (!mappingPath) {
          return
        }

        const fixedFilePath = mappingPath.isExactMatch
          ? mappingPath.distPath
          : path.join(mappingPath.distPath, absoluteImportFilePath.slice(mappingPath.absoluteSrcPath.length))

        if (fixedFilePath !== importFilePath) {
          context.report({
            node,
            data: { filePath: fixedFilePath },
            messageId: 'hasTsPathsImport',
            fix(fixer) {
              return fixer.replaceText(source, `${quote}${fixedFilePath}${quote}`)
            },
          })
        }
      },
    }
  },
})
