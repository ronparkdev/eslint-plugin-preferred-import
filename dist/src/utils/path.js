import path from 'path';
export const getLintingFilePath = (context) => {
    var _a;
    const options = ((_a = context.options) === null || _a === void 0 ? void 0 : _a[0]) || {};
    const basePath = options.basePath || process.cwd();
    const currentFilename = context.getFilename();
    return path.resolve(basePath, currentFilename);
};
export const getSepSuffixedFolderPath = (folderPath) => {
    if (folderPath.endsWith(path.sep)) {
        return folderPath;
    }
    return `${folderPath}${path.sep}`;
};
