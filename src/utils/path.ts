import path from 'path'

// Return linting file path of eslint
export const getLintingFilePath = (context) => {
  const options = context.options?.[0] || {}
  const basePath = options.basePath || process.cwd()
  const currentFilename = context.getFilename()
  return path.resolve(basePath, currentFilename)
}

// Add path separator ('/') if not exists
export const getSepSuffixedFolderPath = (folderPath: string) => {
  if (folderPath.endsWith(path.sep)) {
    return folderPath
  }
  return `${folderPath}${path.sep}`
}
