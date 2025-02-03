"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const utils_1 = require("@typescript-eslint/utils");
const createRule_1 = require("../utils/createRule");
const importRuleUtils_1 = require("../utils/importRuleUtils");
const path_2 = require("../utils/path");
const TARGET_PATH_POSTFIXES = ['.tsx', '.ts', '/index.tsx', '/index.ts', '.js', '/index.js'];
exports.default = (0, createRule_1.createRule)({
    name: 'ts-imports',
    meta: {
        docs: {
            description: 'Check for replaceable imports defined in paths of tsconfig.json',
            recommended: 'error',
            suggestion: true,
        },
        fixable: 'code',
        type: 'suggestion',
        schema: [
            {
                type: 'object',
                properties: {
                    ignoreCurrentDirectoryImport: {
                        description: 'Ignore lint for import of current folder reference (`./`)',
                        type: 'boolean',
                        default: false,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            hasTsPathsImport: `has replaceable import '{{filePath}}'`,
        },
    },
    defaultOptions: [{ ignoreCurrentDirectoryImport: true }],
    create(context, [options]) {
        const { ignoreCurrentDirectoryImport } = options || {};
        const { program } = utils_1.ESLintUtils.getParserServices(context);
        const compilerOptions = program.getCompilerOptions();
        const currentDirectory = program.getCurrentDirectory();
        const { paths = {}, baseUrl = currentDirectory } = compilerOptions;
        const mappingPaths = createMappingPaths(paths, baseUrl);
        return {
            ImportDeclaration(node) {
                const importContext = (0, importRuleUtils_1.parseImportDeclaration)(node);
                if (!importContext)
                    return;
                const { quote, importPath } = importContext;
                const filePath = (0, path_2.getLintingFilePath)(context);
                const directoryPath = path_1.default.dirname(filePath);
                const isRelativeImport = importPath.startsWith('.') || importPath.startsWith('..');
                if (isRelativeImport && ignoreCurrentDirectoryImport && importPath.startsWith('./'))
                    return;
                const absoluteImportPath = path_1.default.resolve(isRelativeImport ? directoryPath : baseUrl, importPath);
                if (isExternalLibrary(program, absoluteImportPath))
                    return;
                const matchingPath = (0, importRuleUtils_1.findMatchingPath)(absoluteImportPath, mappingPaths);
                if (!matchingPath)
                    return;
                const fixedFilePath = (0, importRuleUtils_1.getFixedFilePath)(absoluteImportPath, matchingPath);
                if (fixedFilePath === importPath)
                    return;
                context.report({
                    node,
                    messageId: 'hasTsPathsImport',
                    data: { filePath: fixedFilePath },
                    fix: (0, importRuleUtils_1.createImportFixer)(node, quote, fixedFilePath),
                });
            },
            ExportNamedDeclaration(node) {
                if (!node.source)
                    return;
                const importContext = (0, importRuleUtils_1.parseImportDeclaration)(node);
                if (!importContext)
                    return;
                const { quote, importPath } = importContext;
                const filePath = (0, path_2.getLintingFilePath)(context);
                const directoryPath = path_1.default.dirname(filePath);
                const isRelativeImport = importPath.startsWith('.') || importPath.startsWith('..');
                if (isRelativeImport && ignoreCurrentDirectoryImport && importPath.startsWith('./'))
                    return;
                const absoluteImportPath = path_1.default.resolve(isRelativeImport ? directoryPath : baseUrl, importPath);
                if (isExternalLibrary(program, absoluteImportPath))
                    return;
                const matchingPath = (0, importRuleUtils_1.findMatchingPath)(absoluteImportPath, mappingPaths);
                if (!matchingPath)
                    return;
                const fixedFilePath = (0, importRuleUtils_1.getFixedFilePath)(absoluteImportPath, matchingPath);
                if (fixedFilePath === importPath)
                    return;
                context.report({
                    node,
                    messageId: 'hasTsPathsImport',
                    data: { filePath: fixedFilePath },
                    fix: (0, importRuleUtils_1.createImportFixer)(node, quote, fixedFilePath),
                });
            },
        };
    },
});
function createMappingPaths(paths, baseUrl) {
    return Object.entries(paths).flatMap(([distPath, srcPaths]) => srcPaths.map((srcPath) => {
        const isWildcard = srcPath.endsWith('/*') && distPath.endsWith('/*');
        return {
            absoluteSrcPath: path_1.default.resolve(baseUrl, isWildcard ? srcPath.slice(0, -2) : srcPath),
            distPath: isWildcard ? distPath.slice(0, -2) : distPath,
            isExactMatch: !isWildcard,
        };
    }));
}
function isExternalLibrary(program, absoluteImportPath) {
    return TARGET_PATH_POSTFIXES.map((postfix) => `${absoluteImportPath}${postfix}`)
        .map(program.getSourceFile)
        .filter(Boolean)
        .some((sourceFile) => program.isSourceFileDefaultLibrary(sourceFile) || program.isSourceFileFromExternalLibrary(sourceFile));
}
