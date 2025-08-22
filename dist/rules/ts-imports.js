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
    name: 'ts-imports',
    meta: {
        docs: {
            description: 'Disallow replaceable imports defined in paths of tsconfig.json',
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
    defaultOptions: [
        {
            ignoreCurrentDirectoryImport: true,
        },
    ],
    create(context, [options]) {
        const { ignoreCurrentDirectoryImport } = options || {};
        const { program } = utils_1.ESLintUtils.getParserServices(context);
        const compilerOptions = program.getCompilerOptions();
        const currentDirectory = program.getCurrentDirectory();
        const { paths = {}, baseUrl = currentDirectory } = compilerOptions;
        const mappingPaths = Object.keys(paths).flatMap((distPath) => {
            return paths[distPath].map((srcPath) => {
                if (srcPath.endsWith('/*') && distPath.endsWith('/*')) {
                    return {
                        absoluteSrcPath: path_1.default.resolve(baseUrl, srcPath.slice(0, srcPath.length - 1)),
                        distPath: distPath.slice(0, distPath.length - 1),
                        isExactMatch: false,
                    };
                }
                else {
                    return { absoluteSrcPath: path_1.default.resolve(baseUrl, srcPath), distPath, isExactMatch: true };
                }
            });
        });
        return {
            ImportDeclaration(node) {
                var _a;
                const { source } = node;
                const matchResult = /^(["'])(.*)(\1)$/g.exec(((_a = source === null || source === void 0 ? void 0 : source.raw) === null || _a === void 0 ? void 0 : _a.trim()) || '');
                if (!matchResult) {
                    return;
                }
                const [_, quote, importFilePath] = matchResult;
                if (ignoreCurrentDirectoryImport && importFilePath.startsWith('./')) {
                    return;
                }
                const filePath = (0, path_2.getLintingFilePath)(context);
                const directoryPath = path_1.default.dirname(filePath);
                const isRelativeImportFilePath = !!importFilePath
                    .split(path_1.default.sep)
                    .find((subPath) => ['.', '..'].includes(subPath));
                const absoluteImportFilePath = path_1.default.resolve(isRelativeImportFilePath ? directoryPath : baseUrl, importFilePath);
                if (TARGET_PATH_POSTFIXES.map((postfix) => `${absoluteImportFilePath}${postfix}`)
                    .map(program.getSourceFile)
                    .filter((sourceFile) => !!sourceFile)
                    .filter((sourceFile) => program.isSourceFileDefaultLibrary(sourceFile) || program.isSourceFileFromExternalLibrary(sourceFile))
                    .find((sourceFile) => !!sourceFile)) {
                    return;
                }
                const mappingPath = mappingPaths.find(({ absoluteSrcPath, isExactMatch }) => isExactMatch
                    ? absoluteImportFilePath.toLowerCase() === absoluteSrcPath.toLowerCase()
                    : absoluteImportFilePath.toLowerCase().startsWith(absoluteSrcPath.toLocaleLowerCase()));
                if (!mappingPath) {
                    return;
                }
                const fixedFilePath = mappingPath.isExactMatch
                    ? mappingPath.distPath
                    : path_1.default.join(mappingPath.distPath, absoluteImportFilePath.slice(mappingPath.absoluteSrcPath.length));
                if (fixedFilePath !== importFilePath) {
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
