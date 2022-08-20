"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSepSuffixedFolderPath = exports.findPathOfMatchedFile = exports.getLintingFilePath = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const micromatch_1 = __importDefault(require("micromatch"));
const getLintingFilePath = (context) => {
    var _a;
    const options = ((_a = context.options) === null || _a === void 0 ? void 0 : _a[0]) || {};
    const basePath = options.basePath || process.cwd();
    const currentFilename = context.getFilename();
    return path_1.default.resolve(basePath, currentFilename);
};
exports.getLintingFilePath = getLintingFilePath;
const findPathOfMatchedFile = (currentDirectoryPath, matcher) => {
    const possibleDirectoryPaths = currentDirectoryPath
        .split(path_1.default.sep)
        .reduce((paths, subPath) => {
        const lastPath = paths[paths.length - 1] || path_1.default.sep;
        const newPath = path_1.default.resolve(lastPath, subPath);
        return [...paths, newPath];
    }, [])
        .reverse();
    for (const directoryPath of possibleDirectoryPaths) {
        const fileNames = fs_1.default
            .readdirSync(directoryPath, { withFileTypes: true })
            .filter((item) => !item.isDirectory())
            .map((item) => item.name);
        const [matchedFileName] = (0, micromatch_1.default)(fileNames, matcher);
        if (matchedFileName) {
            return path_1.default.resolve(directoryPath, matchedFileName);
        }
    }
    return null;
};
exports.findPathOfMatchedFile = findPathOfMatchedFile;
const getSepSuffixedFolderPath = (folderPath) => {
    if (folderPath.endsWith(path_1.default.sep)) {
        return folderPath;
    }
    return `${folderPath}${path_1.default.sep}`;
};
exports.getSepSuffixedFolderPath = getSepSuffixedFolderPath;
