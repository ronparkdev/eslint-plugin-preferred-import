'use strict'

import noRelativePathImports from './rules/no-relative-path-imports'
import preferTsPathsImports from './rules/prefer-ts-paths-imports'

// Import all rules in lib/rules
module.exports.rules = {
  'prefer-ts-paths-imports': preferTsPathsImports,
  'no-relative-path-imports': noRelativePathImports,
}
