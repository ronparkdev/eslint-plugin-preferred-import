"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const utils_1 = require("@typescript-eslint/utils");
const createRule_1 = require("../utils/createRule");
const path_2 = require("../utils/path");
exports.default = (0, createRule_1.createRule)({
    name: 'no-relative-path-imports',
    meta: {
        docs: {
            description: 'Disallow relative path imports (../*, ./*)',
            recommended: 'error',
            suggestion: true,
        },
        fixable: 'code',
        type: 'suggestion',
        schema: [
            {
                type: 'object',
                properties: {
                    allowParentPathImport: {
                        description: 'If `false`, will report ../ included imports.',
                        type: 'boolean',
                        default: false,
                    },
                    allowChildPathImport: {
                        description: 'If `false`, will report ./ included imports.',
                        type: 'boolean',
                        default: false,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            hasRelativePathImport: `has relative path import '{{filePath}}'`,
        },
    },
    defaultOptions: [
        {
            allowParentPathImport: false,
            allowChildPathImport: false,
        },
    ],
    create(context, [options]) {
        const targetSubPaths = [];
        if (options.allowParentPathImport !== true) {
            targetSubPaths.push('..');
        }
        if (options.allowChildPathImport !== true) {
            targetSubPaths.push('.');
        }
        const { program } = utils_1.ESLintUtils.getParserServices(context);
        const compilerOptions = program.getCompilerOptions();
        const currentDirectory = program.getCurrentDirectory();
        const { baseUrl = currentDirectory } = compilerOptions;
        const sepSuffixedBaseUrl = (0, path_2.getSepSuffixedFolderPath)(baseUrl);
        const getFixedFilePath = (relativeTargetFilePath) => {
            const lintingFilePath = (0, path_2.getLintingFilePath)(context);
            const lintingFolderPath = path_1.default.dirname(lintingFilePath);
            const absoluteTargetFilePath = path_1.default.resolve(lintingFolderPath, relativeTargetFilePath);
            if (absoluteTargetFilePath.toLowerCase().startsWith(sepSuffixedBaseUrl.toLocaleLowerCase())) {
                return absoluteTargetFilePath.slice(sepSuffixedBaseUrl.length);
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
                const isRelativePath = !!importPath.split(path_1.default.sep).find((subPath) => targetSubPaths.includes(subPath));
                if (!isRelativePath) {
                    return;
                }
                const fixedFilePath = getFixedFilePath(importPath);
                if (!!fixedFilePath && fixedFilePath !== importPath) {
                    context.report({
                        node,
                        data: { filePath: fixedFilePath },
                        messageId: 'hasRelativePathImport',
                        fix(fixer) {
                            return fixer.replaceText(source, `${quote}${fixedFilePath}${quote}`);
                        },
                    });
                }
            },
        };
    },
});
