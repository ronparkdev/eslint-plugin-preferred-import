"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageId = void 0;
const utils_1 = require("@typescript-eslint/utils");
const path_1 = __importDefault(require("path"));
const path_2 = require("../utils/path");
var MessageId;
(function (MessageId) {
    MessageId["HAS_RELATIVE_PATH_IMPORT"] = "HAS_RELATIVE_PATH_IMPORT";
})(MessageId = exports.MessageId || (exports.MessageId = {}));
exports.default = {
    meta: {
        docs: {
            description: 'Disallow relative path imports (../*, ./*)',
            category: 'Best Practices',
            recommended: false,
        },
        fixable: 'code',
        type: 'suggestion',
        schema: [],
        messages: {
            [MessageId.HAS_RELATIVE_PATH_IMPORT]: `has relative path import '{{filePath}}'`,
        },
    },
    create(context) {
        const { program } = utils_1.ESLintUtils.getParserServices(context);
        const compilerOptions = program.getCompilerOptions();
        const currentDirectory = program.getCurrentDirectory();
        const { paths = {}, baseUrl = currentDirectory } = compilerOptions;
        const sepSuffixedBaseUrl = (0, path_2.getSepSuffixedFolderPath)(baseUrl);
        const pathMap = {};
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
                const isRelativePath = !!importPath.split(path_1.default.sep).find((subPath) => ['.', '..'].includes(subPath));
                if (!isRelativePath) {
                    return;
                }
                const fixedFilePath = getFixedFilePath(importPath);
                if (!!fixedFilePath && fixedFilePath !== importPath) {
                    context.report({
                        node,
                        data: { filePath: fixedFilePath },
                        messageId: MessageId.HAS_RELATIVE_PATH_IMPORT,
                        fix(fixer) {
                            return fixer.replaceText(source, `${quote}${fixedFilePath}${quote}`);
                        },
                    });
                }
            },
        };
    },
};