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
        const { resolveAlias: rawResolveAlias, ignoreCurrentDirectoryImport } = options || {};
        const resolveAlias = Object.keys(rawResolveAlias).reduce((map, key) => (Object.assign(Object.assign({}, map), { [rawResolveAlias[key]]: key.endsWith('$')
                ? { path: key.slice(0, key.length - 1), isExactMatch: true }
                : { path: key, isExactMatch: false } })), {});
        const getFixedFilePath = (filePath) => {
            const key = Object.keys(resolveAlias).find((key) => resolveAlias[key].isExactMatch
                ? filePath.toLowerCase() === key.toLowerCase()
                : filePath.toLowerCase().startsWith(key.toLowerCase()));
            if (!key) {
                return null;
            }
            const { path } = resolveAlias[key];
            return `${path}${filePath.slice(key.length)}`;
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
                if (ignoreCurrentDirectoryImport && importPath.startsWith('./')) {
                    return;
                }
                const lintingFilePath = (0, path_2.getLintingFilePath)(context);
                const lintingDirectoryPath = path_1.default.dirname(lintingFilePath);
                const absoluteImportPath = path_1.default.resolve(lintingDirectoryPath, importPath);
                const fixedFilePath = getFixedFilePath(absoluteImportPath);
                if (!!fixedFilePath && fixedFilePath !== importPath) {
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
