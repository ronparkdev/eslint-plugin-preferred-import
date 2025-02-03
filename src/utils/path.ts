import path from 'path'

export const getParentPaths = (directoryPath: string): string[] => {
  return directoryPath
    .split(path.sep)
    .reduce<string[]>((paths, subPath) => {
      const lastPath = paths[paths.length - 1] || path.sep
      const newPath = path.resolve(lastPath, subPath)
      return [...paths, newPath]
    }, [])
    .reverse()
}

export const ensureSeparatorSuffix = (folderPath: string): string => {
  return folderPath.endsWith(path.sep) ? folderPath : `${folderPath}${path.sep}`
}

export const getLintingFilePath = (context: any): string => {
  const options = context.options?.[0] || {}
  const basePath = options.basePath || process.cwd()
  return path.resolve(basePath, context.getFilename())
}
