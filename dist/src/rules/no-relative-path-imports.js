import { ESLintUtils } from '@typescript-eslint/utils';
import path from 'path';
import { getLintingFilePath, getSepSuffixedFolderPath } from '../utils/path';
export var MessageId;
(function (MessageId) {
    MessageId["HAS_RELATIVE_PATH_IMPORT"] = "HAS_RELATIVE_PATH_IMPORT";
})(MessageId || (MessageId = {}));
export default {
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
        const { program } = ESLintUtils.getParserServices(context);
        const compilerOptions = program.getCompilerOptions();
        const currentDirectory = program.getCurrentDirectory();
        const { paths = {}, baseUrl = currentDirectory } = compilerOptions;
        const sepSuffixedBaseUrl = getSepSuffixedFolderPath(baseUrl);
        const pathMap = {};
        const getFixedFilePath = (relativeTargetFilePath) => {
            const lintingFilePath = getLintingFilePath(context);
            const lintingFolderPath = path.dirname(lintingFilePath);
            const absoluteTargetFilePath = path.resolve(lintingFolderPath, relativeTargetFilePath);
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
                const isRelativePath = !!importPath.split(path.sep).find((subPath) => ['.', '..'].includes(subPath));
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
