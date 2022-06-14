"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSepSuffixedFolderPath = exports.getLintingFilePath = void 0;
const path_1 = __importDefault(require("path"));
const getLintingFilePath = (context) => {
    var _a;
    const options = ((_a = context.options) === null || _a === void 0 ? void 0 : _a[0]) || {};
    const basePath = options.basePath || process.cwd();
    const currentFilename = context.getFilename();
    return path_1.default.resolve(basePath, currentFilename);
};
exports.getLintingFilePath = getLintingFilePath;
const getSepSuffixedFolderPath = (folderPath) => {
    if (folderPath.endsWith(path_1.default.sep)) {
        return folderPath;
    }
    return `${folderPath}${path_1.default.sep}`;
};
exports.getSepSuffixedFolderPath = getSepSuffixedFolderPath;
