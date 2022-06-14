'use strict';
const noRelativeImports = require('./rules/prefer-ts-paths-imports');
module.exports.rules = {
    'prefer-ts-paths-imports': noRelativeImports,
};
