import path from 'path'

import { ESLintUtils } from '@typescript-eslint/utils'

import { createRule } from '../utils/createRule'
import { getLintingFilePath } from '../utils/path'

type MappingPathMap = {
  [absoluteSrcPath: string]: {
    distPath: string
    prefixed: boolean
  }
}

type Options = [
  {
    ignoreChildPathImport?: boolean
  },
]

type MessageIds = 'hasTsPathsImport'

const TARGET_PATH_POSTFIXES = ['.tsx', '.ts', '/index.tsx', '/index.ts', '.js', '/index.js']

export default createRule<Options, MessageIds>({
  name: 'ts-imports',
  meta: {
    docs: {
      description: 'Disallow replaceable imports defined in paths of tsconfig.json',
      recommended: 'error',
      suggestion: true,
    },
    fixable: 'code',
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: {
          ignoreChildPathImport: {
            description: 'If `true`, will ignore ./ included imports.',
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
      ignoreChildPathImport: false,
    },
  ],
  create(context, [options]) {
    const { ignoreChildPathImport } = options || {}
    const { program } = ESLintUtils.getParserServices(context)

    const compilerOptions = program.getCompilerOptions()
    const currentDirectory = program.getCurrentDirectory()

    const { paths = {}, baseUrl = currentDirectory } = compilerOptions

    // Get replace path map for replacing from absolute path to short path
    const pathMap: MappingPathMap = {}

    Object.keys(paths).forEach((distPath) => {
      paths[distPath].forEach((srcPath) => {
        const absoluteSrcPath = path.resolve(baseUrl, srcPath)
        const isPrefixed = absoluteSrcPath.endsWith('/*') && distPath.endsWith('/*')
        if (isPrefixed) {
          // Applies to all files in that folder
          const newSrcPath = absoluteSrcPath.slice(0, absoluteSrcPath.length - 1)
          const newDistPath = distPath.slice(0, distPath.length - 1)

          pathMap[newSrcPath] = { distPath: newDistPath, prefixed: true }
        } else {
          // Apply only this file
          pathMap[absoluteSrcPath] = { distPath, prefixed: false }
        }
      })
    })

    console.log({ pathMap })

    const checkIsInternalSourceFile = (filePath: string) => {
      return !!TARGET_PATH_POSTFIXES.map((postfix) => `${filePath}${postfix}`)
        .map((path) => program.getSourceFile(path))
        .filter(
          (sourceFile) =>
            sourceFile &&
            !program.isSourceFileDefaultLibrary(sourceFile) &&
            !program.isSourceFileFromExternalLibrary(sourceFile),
        )
        .find((sourceFile) => !!sourceFile)
    }

    const getFixedFilePath = (targetPath) => {
      const lintingPath = getLintingFilePath(context)
      const lintingBasePath = path.dirname(lintingPath)

      const isRelativeTargetPath = !!targetPath.split(path.sep).find((subPath) => ['.', '..'].includes(subPath))

      const absoluteTargetPath = path.resolve(isRelativeTargetPath ? lintingBasePath : baseUrl, targetPath)

      const isInternalTargetPath = checkIsInternalSourceFile(absoluteTargetPath)

      console.log({ targetPath, isRelativeTargetPath, absoluteTargetPath, isInternalTargetPath })

      TARGET_PATH_POSTFIXES.map((postfix) => `${absoluteTargetPath}${postfix}`)
        .map((path) => program.getSourceFile(path))
        .forEach((sourceFile) => {
          if (sourceFile) {
            const isSourceFileDefaultLibrary = program.isSourceFileDefaultLibrary(sourceFile)
            const isSourceFileFromExternalLibrary = program.isSourceFileFromExternalLibrary(sourceFile)
            console.log({ isSourceFileDefaultLibrary, isSourceFileFromExternalLibrary })
          }
        })

      console.log(
        program
          .getSourceFiles()
          .filter((sp) => !program.isSourceFileFromExternalLibrary(sp))
          .map((s) => s.fileName),
      )

      // Ignore external library and default library
      if (!isInternalTargetPath) {
        return null
      }

      for (const absoluteSrcPath of Object.keys(pathMap)) {
        const { distPath, prefixed } = pathMap[absoluteSrcPath]

        // Ignore case between two files
        if (prefixed) {
          if (absoluteTargetPath.toLowerCase().startsWith(absoluteSrcPath.toLocaleLowerCase())) {
            return path.join(distPath, absoluteTargetPath.slice(absoluteSrcPath.length))
          }
        } else {
          if (absoluteTargetPath.toLowerCase() === absoluteSrcPath.toLowerCase()) {
            return distPath
          }
        }
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

        if (ignoreChildPathImport && importPath.startsWith('./')) {
          return
        }

        const fixedFilePath = getFixedFilePath(importPath)

        if (!!fixedFilePath && fixedFilePath !== importPath) {
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
