"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const createRule_1 = require("../utils/createRule");
const importRuleUtils_1 = require("../utils/importRuleUtils");
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
        const mappingPaths = Object.entries(resolveAliasMap).map(([distPath, absoluteSrcPath]) => {
            const isExactMatch = distPath.endsWith('$');
            return {
                absoluteSrcPath,
                distPath: isExactMatch ? distPath.slice(0, -1) : distPath,
                isExactMatch,
            };
        });
        return {
            ImportDeclaration(node) {
                const importContext = (0, importRuleUtils_1.parseImportDeclaration)(node);
                if (!importContext)
                    return;
                const { quote, importPath } = importContext;
                if ((0, importRuleUtils_1.shouldIgnoreImport)(importPath, ignoreCurrentDirectoryImport))
                    return;
                const lintingFilePath = (0, path_2.getLintingFilePath)(context);
                const lintingDirectoryPath = path_1.default.dirname(lintingFilePath);
                const absoluteImportPath = path_1.default.resolve(lintingDirectoryPath, importPath);
                const resolveAlias = (0, importRuleUtils_1.findMatchingPath)(absoluteImportPath, mappingPaths);
                if (!resolveAlias)
                    return;
                const fixedFilePath = (0, importRuleUtils_1.getFixedFilePath)(absoluteImportPath, resolveAlias);
                if (fixedFilePath !== importPath) {
                    context.report({
                        node,
                        data: { filePath: fixedFilePath },
                        messageId: 'hasPreferredImport',
                        fix: (0, importRuleUtils_1.createImportFixer)(node, quote, fixedFilePath),
                    });
                }
            },
            ExportNamedDeclaration(node) {
                if (!node.source)
                    return;
                const importContext = (0, importRuleUtils_1.parseImportDeclaration)(node);
                if (!importContext)
                    return;
                const { quote, importPath } = importContext;
                if ((0, importRuleUtils_1.shouldIgnoreImport)(importPath, ignoreCurrentDirectoryImport))
                    return;
                const lintingFilePath = (0, path_2.getLintingFilePath)(context);
                const lintingDirectoryPath = path_1.default.dirname(lintingFilePath);
                const absoluteImportPath = path_1.default.resolve(lintingDirectoryPath, importPath);
                const resolveAlias = (0, importRuleUtils_1.findMatchingPath)(absoluteImportPath, mappingPaths);
                if (!resolveAlias)
                    return;
                const fixedFilePath = (0, importRuleUtils_1.getFixedFilePath)(absoluteImportPath, resolveAlias);
                if (fixedFilePath !== importPath) {
                    context.report({
                        node,
                        data: { filePath: fixedFilePath },
                        messageId: 'hasPreferredImport',
                        fix: (0, importRuleUtils_1.createImportFixer)(node, quote, fixedFilePath),
                    });
                }
            },
        };
    },
});
