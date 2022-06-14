'use strict'

import preferTsPathsImports from './rules/prefer-ts-paths-imports'
import noRelativePathImports from './rules/no-relative-path-imports'

// Import all rules in lib/rules
module.exports.rules = {
  'prefer-ts-paths-imports': preferTsPathsImports,
  'no-relative-path-imports': noRelativePathImports,
}
