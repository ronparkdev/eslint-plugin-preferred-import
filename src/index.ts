'use strict'

import noRelativePathImports from './rules/no-relative-path-imports'
import tsImports from './rules/ts-imports'

// Import all rules in lib/rules
module.exports.rules = {
  'ts-imports': tsImports,
  'no-relative-path-imports': noRelativePathImports,
}
