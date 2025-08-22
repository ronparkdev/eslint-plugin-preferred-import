import noRelativePathImports from './rules/js-imports'
import tsImports from './rules/ts-imports'

// Import all rules in lib/rules
module.exports.rules = {
  'ts-imports': tsImports,
  'js-imports': noRelativePathImports,
}
