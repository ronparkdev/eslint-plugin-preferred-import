"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLintingFilePath = exports.ensureSeparatorSuffix = exports.getParentPaths = void 0;
const path_1 = __importDefault(require("path"));
const getParentPaths = (directoryPath) => {
    return directoryPath
        .split(path_1.default.sep)
        .reduce((paths, subPath) => {
        const lastPath = paths[paths.length - 1] || path_1.default.sep;
        const newPath = path_1.default.resolve(lastPath, subPath);
        return [...paths, newPath];
    }, [])
        .reverse();
};
exports.getParentPaths = getParentPaths;
const ensureSeparatorSuffix = (folderPath) => {
    return folderPath.endsWith(path_1.default.sep) ? folderPath : `${folderPath}${path_1.default.sep}`;
};
exports.ensureSeparatorSuffix = ensureSeparatorSuffix;
const getLintingFilePath = (context) => {
    var _a;
    const options = ((_a = context.options) === null || _a === void 0 ? void 0 : _a[0]) || {};
    const basePath = options.basePath || process.cwd();
    return path_1.default.resolve(basePath, context.getFilename());
};
exports.getLintingFilePath = getLintingFilePath;
