# eslint-plugin-preferred-import
[![NPM version][npm-image]][npm-url] [![Build Status][build-image]][build-url]

This ESLint plugin replaces imports written with relative paths with alias paths from the tsconfig.json file, ensuring that the correct paths are used. Therefore, this plugin does not fix incorrect paths, but rather modifies the paths to use the appropriate aliases.

![1664534016](https://user-images.githubusercontent.com/47266692/193251941-8a881625-971e-4abe-ae52-6f92d6a0ef94.gif)

# Installation
First, install ESLint:
```
npm i eslint --save-dev
```

Next, install `eslint-plugin-preferred-import`:
```
npm i eslint-plugin-preferred-import --save-dev
```


# Usage
## If your project is based on **Typescript**, use the `ts-import` rule

### ESLint 9+ (Flat Config)
Here is a suggested ESLint configuration for ESLint 9+:
```javascript
// eslint.config.mjs
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import preferredImport from 'eslint-plugin-preferred-import'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true, // Automatically finds the nearest tsconfig for each file
      },
    },
    plugins: { 'preferred-import': preferredImport },
    rules: {
      'preferred-import/ts-imports': 'error',
    },
  },
  { ignores: ['**/node_modules/**','**/dist/**','**/.next/**','**/.turbo/**'] },
)
```

### ESLint 8 and below
Here is a suggested ESLint configuration for ESLint 8 and below:
```javascript
{
  parser: '@typescript-eslint/parser', // Should be used ts-eslint parser
  plugins: [..., 'preferred-import'], // Add 'preferred-import' next to old plugins
  overrides: [
    // Add rules into overrides
    {
      files: ['src/**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json']
      },
      rules: {
        'preferred-import/ts-imports': 'error'
      }
    }
  ],
}
```

The ts-imports rule checks for replaceable paths based on the basePath and paths fields in the tsconfig.json file, and it is auto-fixable.

## If your project is based on JavaScript, use the `js-imports` rule
Here is a suggested ESLint configuration:
```js
const path = require('path')

module.exports = {
  plugins: [..., 'preferred-import'], // Add 'preferred-import' next to old plugins
  rules: {
    // Add your rule config to the rules, resolveAlias should be same value with webpack alias
    'preferred-import/js-imports': ['error', {
      'resolveAlias': {
        'utils': path.resolve(__dirname, 'src/utils'),
        'reducer$': path.resolve(__dirname, 'src/reducer'),
      }
    }]
  }
}
```

The js-imports rule checks for replaceable paths based on the configuration provided in the rules object, and it is auto-fixable.

# Supported Rules
* [`ts-imports`](https://github.com/ronparkdev/eslint-plugin-preferred-import/blob/master/documents/ts-imports.md) : Checks for replaceable paths based on `basePath` and `paths` field in tsconfig.json, and is auto-fixable.

* [`js-imports`](https://github.com/ronparkdev/eslint-plugin-preferred-import/blob/master/documents/js-imports.md) : Checks for replaceable paths based on configuration provided in the rules object, and is auto-fixable.

# License
BSD License

[npm-image]: http://img.shields.io/npm/v/eslint-plugin-preferred-import.svg
[npm-url]: https://npmjs.org/package/eslint-plugin-preferred-import

[build-image]: http://img.shields.io/github/workflow/status/ronpark-dev/eslint-plugin-preferred-import/Build%20and%20unit%20test.svg
[build-url]: https://github.com/ronpark-dev/eslint-plugin-preferred-import/actions/workflows/ci.yml
