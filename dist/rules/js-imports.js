"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const createRule_1 = require("../utils/createRule");
const path_2 = require("../utils/path");
exports.default = (0, createRule_1.createRule)({
    name: 'js-imports',
    meta: {
        docs: {
            description: 'Check for replaceable to absolute paths',
            recommended: 'error',
            suggestion: true,
        },
        fixable: 'code',
        type: 'suggestion',
        schema: [
            {
                type: 'object',
                properties: {
                    resolveAlias: {
                        description: 'Alias for path',
                        type: 'object',
                        default: {},
                    },
                    ignoreCurrentDirectoryImport: {
                        description: 'Ignore lint for import of current folder reference (`./`)',
                        type: 'boolean',
                        default: true,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            hasPreferredImport: `has preferred import '{{filePath}}'`,
        },
    },
    defaultOptions: [
        {
            resolveAlias: {},
            ignoreCurrentDirectoryImport: true,
        },
    ],
    create(context, [options]) {
        const { resolveAlias: resolveAliasMap, ignoreCurrentDirectoryImport } = options || {};
        const mappingPaths = Object.keys(resolveAliasMap).map((distPath) => {
            const isExactMatch = distPath.endsWith('$');
            return {
                absoluteSrcPath: resolveAliasMap[distPath],
                distPath: isExactMatch ? distPath.slice(0, -1) : distPath,
                isExactMatch,
            };
        });
        return {
            ImportDeclaration(node) {
                var _a;
                const { source } = node;
                const matchResult = /^(["'])(.*)(\1)$/g.exec(((_a = source === null || source === void 0 ? void 0 : source.raw) === null || _a === void 0 ? void 0 : _a.trim()) || '');
                if (!matchResult) {
                    return;
                }
                const [_, quote, importPath] = matchResult;
                if (!importPath.split(path_1.default.sep).find((subPath) => ['.', '..'].includes(subPath))) {
                    return;
                }
                if (ignoreCurrentDirectoryImport && importPath.startsWith('./')) {
                    return;
                }
                const lintingFilePath = (0, path_2.getLintingFilePath)(context);
                const lintingDirectoryPath = path_1.default.dirname(lintingFilePath);
                const absoluteImportPath = path_1.default.resolve(lintingDirectoryPath, importPath);
                const resolveAlias = mappingPaths.find(({ absoluteSrcPath, isExactMatch }) => isExactMatch
                    ? absoluteImportPath.toLowerCase() === absoluteSrcPath.toLowerCase()
                    : absoluteImportPath.toLowerCase().startsWith(absoluteSrcPath.toLowerCase()));
                if (!resolveAlias) {
                    return;
                }
                const fixedFilePath = `${resolveAlias.distPath}${absoluteImportPath.slice(resolveAlias.absoluteSrcPath.length)}`;
                if (fixedFilePath !== importPath) {
                    context.report({
                        node,
                        data: { filePath: fixedFilePath },
                        messageId: 'hasPreferredImport',
                        fix(fixer) {
                            return fixer.replaceText(source, `${quote}${fixedFilePath}${quote}`);
                        },
                    });
                }
            },
        };
    },
});
