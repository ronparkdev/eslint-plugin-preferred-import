import fs from 'fs'
import path from 'path'

import micromatch from 'micromatch'

// Return linting file path of eslint
export const getLintingFilePath = (context) => {
  const options = context.options?.[0] || {}
  const basePath = options.basePath || process.cwd()
  const currentFilename = context.getFilename()
  return path.resolve(basePath, currentFilename)
}

// Find nearest matched file path though parent directory
export const findPathOfMatchedFile = (currentDirectoryPath: string, matcher: string | string[]): string | null => {
  const possibleDirectoryPaths = currentDirectoryPath
    .split(path.sep)
    .reduce((paths, subPath) => {
      const lastPath = paths[paths.length - 1] || path.sep
      const newPath = path.resolve(lastPath, subPath)
      return [...paths, newPath]
    }, [])
    .reverse()

  for (const directoryPath of possibleDirectoryPaths) {
    const fileNames = fs
      .readdirSync(directoryPath, { withFileTypes: true })
      .filter((item) => !item.isDirectory())
      .map((item) => item.name)

    const [matchedFileName] = micromatch(fileNames, matcher)

    if (matchedFileName) {
      return path.resolve(directoryPath, matchedFileName)
    }
  }

  return null
}

// Add path separator ('/') if not exists
export const getSepSuffixedFolderPath = (folderPath: string) => {
  if (folderPath.endsWith(path.sep)) {
    return folderPath
  }
  return `${folderPath}${path.sep}`
}
