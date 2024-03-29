import { ESLintUtils } from '@typescript-eslint/utils'

// eslint-disable-next-line new-cap
export const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ronparkdev/eslint-plugin-preferred-import/tree/main/documents/${name}.md`,
)
