import { ESLintUtils } from '@typescript-eslint/utils';
import path from 'path';
import { getLintingFilePath } from '../utils/path';
export var MessageId;
(function (MessageId) {
    MessageId["HAS_TS_PATHS_IMPORT"] = "HAS_TS_PATHS_IMPORT";
})(MessageId || (MessageId = {}));
export default {
    meta: {
        docs: {
            description: 'Disallow replaceable imports defined in paths of tsconfig.json',
            category: 'Best Practices',
            recommended: false,
        },
        fixable: 'code',
        type: 'suggestion',
        schema: [],
        messages: {
            [MessageId.HAS_TS_PATHS_IMPORT]: `has replaceable import '{{filePath}}'`,
        },
    },
    create(context) {
        const { program } = ESLintUtils.getParserServices(context);
        const compilerOptions = program.getCompilerOptions();
        const currentDirectory = program.getCurrentDirectory();
        const { paths = {}, baseUrl = currentDirectory } = compilerOptions;
        const pathMap = {};
        Object.keys(paths).forEach((distPath) => {
            paths[distPath].forEach((srcPath) => {
                const absoluteSrcPath = path.resolve(baseUrl, srcPath);
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
            const lintingFilePath = getLintingFilePath(context);
            const lintingFolderPath = path.dirname(lintingFilePath);
            const absoluteTargetFilePath = path.resolve(lintingFolderPath, relativeTargetFilePath);
            for (const absoluteSrcFilePath of Object.keys(pathMap)) {
                const { distPath, prefixed } = pathMap[absoluteSrcFilePath];
                if (prefixed) {
                    if (absoluteTargetFilePath.toLowerCase().startsWith(absoluteSrcFilePath.toLocaleLowerCase())) {
                        return path.join(distPath, absoluteTargetFilePath.slice(absoluteSrcFilePath.length));
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
                        messageId: MessageId.HAS_TS_PATHS_IMPORT,
                        fix(fixer) {
                            return fixer.replaceText(source, `${quote}${fixedFilePath}${quote}`);
                        },
                    });
                }
            },
        };
    },
};
