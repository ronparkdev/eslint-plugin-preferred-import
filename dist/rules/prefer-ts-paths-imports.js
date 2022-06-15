"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const path_1 = __importDefault(require("path"));
const createRule_1 = require("../utils/createRule");
const path_2 = require("../utils/path");
exports.default = (0, createRule_1.createRule)({
    name: 'prefer-ts-paths-imports',
    meta: {
        docs: {
            description: 'Disallow replaceable imports defined in paths of tsconfig.json',
            recommended: 'error',
            suggestion: true,
        },
        fixable: 'code',
        type: 'suggestion',
        schema: [],
        messages: {
            hasTsPathsImport: `has replaceable import '{{filePath}}'`,
        },
    },
    defaultOptions: [],
    create(context) {
        const { program } = utils_1.ESLintUtils.getParserServices(context);
        const compilerOptions = program.getCompilerOptions();
        const currentDirectory = program.getCurrentDirectory();
        const { paths = {}, baseUrl = currentDirectory } = compilerOptions;
        const pathMap = {};
        Object.keys(paths).forEach((distPath) => {
            paths[distPath].forEach((srcPath) => {
                const absoluteSrcPath = path_1.default.resolve(baseUrl, srcPath);
                const isPrefixed = absoluteSrcPath.endsWith('/*') && distPath.endsWith('/*');
                if (isPrefixed) {
                    const newSrcPath = absoluteSrcPath.slice(0, absoluteSrcPath.length - 1);
                    const newDistPath = distPath.slice(0, distPath.length - 1);
                    pathMap[newSrcPath] = { distPath: newDistPath, prefixed: true };
                }
                else {
                    pathMap[absoluteSrcPath] = { distPath, prefixed: false };
                }
            });
        });
        const getFixedFilePath = (relativeTargetFilePath) => {
            const lintingFilePath = (0, path_2.getLintingFilePath)(context);
            const lintingFolderPath = path_1.default.dirname(lintingFilePath);
            const absoluteTargetFilePath = path_1.default.resolve(lintingFolderPath, relativeTargetFilePath);
            for (const absoluteSrcFilePath of Object.keys(pathMap)) {
                const { distPath, prefixed } = pathMap[absoluteSrcFilePath];
                if (prefixed) {
                    if (absoluteTargetFilePath.toLowerCase().startsWith(absoluteSrcFilePath.toLocaleLowerCase())) {
                        return path_1.default.join(distPath, absoluteTargetFilePath.slice(absoluteSrcFilePath.length));
                    }
                }
                else {
                    if (absoluteTargetFilePath.toLowerCase() === absoluteSrcFilePath.toLowerCase()) {
                        return distPath;
                    }
                }
            }
            return null;
        };
        return {
            ImportDeclaration(node) {
                var _a;
                const { source } = node;
                const matchResult = /^(["'])(.*)(\1)$/g.exec(((_a = source === null || source === void 0 ? void 0 : source.raw) === null || _a === void 0 ? void 0 : _a.trim()) || '');
                if (!matchResult) {
                    return;
                }
                const [_, quote, importPath] = matchResult;
                const fixedFilePath = getFixedFilePath(importPath);
                if (!!fixedFilePath && fixedFilePath !== importPath) {
                    context.report({
                        node,
                        data: { filePath: fixedFilePath },
                        messageId: 'hasTsPathsImport',
                        fix(fixer) {
                            return fixer.replaceText(source, `${quote}${fixedFilePath}${quote}`);
                        },
                    });
                }
            },
        };
    },
});
