import { ESLintUtils } from '@typescript-eslint/utils'

export const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/r0npark/eslint-plugin-preferred-import/tree/main/documents/${name}.md`,
)
