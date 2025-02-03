"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImportFixer = exports.getFixedFilePath = exports.findMatchingPath = exports.shouldIgnoreImport = exports.parseImportDeclaration = void 0;
const path_1 = __importDefault(require("path"));
function parseImportDeclaration(node) {
    var _a;
    const { source } = node;
    const matchResult = /^(["'])(.*)(\1)$/g.exec(((_a = source === null || source === void 0 ? void 0 : source.raw) === null || _a === void 0 ? void 0 : _a.trim()) || '');
    if (!matchResult) {
        return null;
    }
    const [_, quote, importPath] = matchResult;
    return { quote, importPath };
}
exports.parseImportDeclaration = parseImportDeclaration;
function shouldIgnoreImport(importPath, ignoreCurrentDirectoryImport) {
    if (!importPath.split(path_1.default.sep).find((subPath) => ['.', '..'].includes(subPath))) {
        return true;
    }
    return ignoreCurrentDirectoryImport && importPath.startsWith('./');
}
exports.shouldIgnoreImport = shouldIgnoreImport;
function findMatchingPath(absoluteImportPath, mappingPaths) {
    return mappingPaths.find(({ absoluteSrcPath, isExactMatch }) => isExactMatch
        ? absoluteImportPath.toLowerCase() === absoluteSrcPath.toLowerCase()
        : absoluteImportPath.toLowerCase().startsWith(absoluteSrcPath.toLowerCase()));
}
exports.findMatchingPath = findMatchingPath;
function getFixedFilePath(absoluteImportPath, mappingPath) {
    return mappingPath.isExactMatch
        ? mappingPath.distPath
        : path_1.default.join(mappingPath.distPath, absoluteImportPath.slice(mappingPath.absoluteSrcPath.length));
}
exports.getFixedFilePath = getFixedFilePath;
function createImportFixer(node, quote, fixedFilePath) {
    return (fixer) => fixer.replaceText(node.source, `${quote}${fixedFilePath}${quote}`);
}
exports.createImportFixer = createImportFixer;
