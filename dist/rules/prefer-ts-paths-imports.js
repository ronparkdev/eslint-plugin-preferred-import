"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const utils_1 = require("@typescript-eslint/utils");
const createRule_1 = require("../utils/createRule");
const path_2 = require("../utils/path");
const TARGET_PATH_POSTFIXES = ['.tsx', '.ts', '/index.tsx', '/index.ts', '.js', '/index.js'];
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
        const checkIsInternalSourceFile = (filePath) => {
            return !!TARGET_PATH_POSTFIXES.map((postfix) => `${filePath}${postfix}`)
                .map((path) => program.getSourceFile(path))
                .filter((sourceFile) => sourceFile &&
                !program.isSourceFileDefaultLibrary(sourceFile) &&
                !program.isSourceFileFromExternalLibrary(sourceFile))
                .find((sourceFile) => !!sourceFile);
        };
        const getFixedFilePath = (targetPath) => {
            const lintingPath = (0, path_2.getLintingFilePath)(context);
            const lintingBasePath = path_1.default.dirname(lintingPath);
            const isRelativeTargetPath = !!targetPath.split(path_1.default.sep).find((subPath) => ['.', '..'].includes(subPath));
            const absoluteTargetPath = path_1.default.resolve(isRelativeTargetPath ? lintingBasePath : baseUrl, targetPath);
            const isInternalTargetPath = checkIsInternalSourceFile(absoluteTargetPath);
            if (!isInternalTargetPath) {
                return null;
            }
            for (const absoluteSrcPath of Object.keys(pathMap)) {
                const { distPath, prefixed } = pathMap[absoluteSrcPath];
                if (prefixed) {
                    if (absoluteTargetPath.toLowerCase().startsWith(absoluteSrcPath.toLocaleLowerCase())) {
                        return path_1.default.join(distPath, absoluteTargetPath.slice(absoluteSrcPath.length));
                    }
                }
                else {
                    if (absoluteTargetPath.toLowerCase() === absoluteSrcPath.toLowerCase()) {
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
