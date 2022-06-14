'use strict'

const noRelativeImports = require('./rules/prefer-ts-paths-imports')

// Import all rules in lib/rules
module.exports.rules = {
  'prefer-ts-paths-imports': noRelativeImports,
}
