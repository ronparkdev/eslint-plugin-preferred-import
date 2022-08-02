# eslint-plugin-preferred-import
[![NPM version][npm-image]][npm-url] [![Build Status][build-image]][build-url]

## prefer-ts-paths-imports
The rule that autofix imports to match the settings in tscconfig.json paths

### Configuration Guide
You need setup .eslintrc.js or .eslintrc.json in your project
```js
module.exports = {
  parser: '@typescript-eslint/parser', // Should be use ts-eslint parser
  plugins: ['preferred-import'], // Add 'preferred-import' plugin to plugins
  parserOptions: {
    project: ['./tsconfig.json'], // Add your tsconfig path to parserOptions.project
  },
  rules: {
    'preferred-import/prefer-ts-paths-imports': 'error', // Add your rule config to rules
    // or
    'preferred-import/no-relative-path-imports': ['error', {
      'ignoreChildPathImport': true, // ignore lint of ./ included import, (default is false)
    }]
  }
}
```

## no-relative-path-imports
The rule that autofixes the absolute path if using relative paths `../` and `./`

### Options
* disallowParentPathImport : Whether to allow ../ (default: true)
* disallowChildPathImport : Whether to allow ./ (default: true)

### Configuration Guide
You need setup .eslintrc.js or .eslintrc.json in your project
```js
module.exports = {
  plugins: ['preferred-import'], // Add 'preferred-import' plugin to plugins
  rules: {
    // Add your rule config to rules
    'preferred-import/no-relative-path-imports': ['error', {
      'disallowParentPathImport': true, // do lint of ../ included import, (default is true)
      'disallowChildPathImport': true, // do lint of ./ included import, (default is true)
    }]
  }
}
```

[npm-image]: http://img.shields.io/npm/v/eslint-plugin-preferred-import.svg
[npm-url]: https://npmjs.org/package/eslint-plugin-preferred-import

[build-image]: http://img.shields.io/github/workflow/status/ronpark-dev/eslint-plugin-preferred-import/Build%20and%20unit%20test.svg
[build-url]: https://github.com/ronpark-dev/eslint-plugin-preferred-import/actions/workflows/ci.yml
