import path from 'path'

export interface MappingPath {
  absoluteSrcPath: string
  distPath: string
  isExactMatch: boolean
}

export interface ImportContext {
  quote: string
  importPath: string
}

export function parseImportDeclaration(node: any): ImportContext | null {
  const { source } = node
  const matchResult = /^(["'])(.*)(\1)$/g.exec(source?.raw?.trim() || '')
  if (!matchResult) {
    return null
  }

  const [_, quote, importPath] = matchResult
  return { quote, importPath }
}

export function shouldIgnoreImport(importPath: string, ignoreCurrentDirectoryImport: boolean): boolean {
  if (!importPath.split(path.sep).find((subPath) => ['.', '..'].includes(subPath))) {
    return true
  }

  return ignoreCurrentDirectoryImport && importPath.startsWith('./')
}

export function findMatchingPath(absoluteImportPath: string, mappingPaths: MappingPath[]): MappingPath | undefined {
  return mappingPaths.find(({ absoluteSrcPath, isExactMatch }) =>
    isExactMatch
      ? absoluteImportPath.toLowerCase() === absoluteSrcPath.toLowerCase()
      : absoluteImportPath.toLowerCase().startsWith(absoluteSrcPath.toLowerCase()),
  )
}

export function getFixedFilePath(absoluteImportPath: string, mappingPath: MappingPath): string {
  return mappingPath.isExactMatch
    ? mappingPath.distPath
    : path.join(mappingPath.distPath, absoluteImportPath.slice(mappingPath.absoluteSrcPath.length))
}

export function createImportFixer(node: any, quote: string, fixedFilePath: string) {
  return (fixer: any) => fixer.replaceText(node.source, `${quote}${fixedFilePath}${quote}`)
}
