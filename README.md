# eslint-plugin-preferred-import
[![NPM version][npm-image]][npm-url] [![Build Status][build-image]][build-url]

An ESLint plugin for check import path with typescript. This rule read your paths config in tsconfig.json and check your import path that it is correct. And even if incorrect, try to **Auto Fix**.

# Installation
You’ll first need to install ESLint:
```
npm i eslint --save-dev
```

Next, install `eslint-plugin-preferred-import`:
```
npm i eslint-plugin-preferred-import --save-dev
```

# Usage
If your project is based on **Typescript**, choice `ts-imports` rule

```javascript
{
  parser: '@typescript-eslint/parser', // Should be use ts-eslint parser
  plugins: [..., 'preferred-import'], // Add 'preferred-import' next to old plugins
  parserOptions: {
    project: ['./tsconfig.json'], // Add your relative path of tsconfig
  },
  rules: {
	  ...,
    // Add below rules next to old rules
    'preferred-import/ts-imports': ['error', {
      'ignoreParentDirectoryImport': true, // Ignore lint that reference the parent folder (../), default is false
      'ignoreCurrentDirectoryImport': true, // Ignore lint that reference the current folder (./), default is false
    }],
  }
}
```

On the other hand, if your project is based on **Javascript**, choice `js-imports` rule

```js
module.exports = {
  plugins: [..., 'preferred-import'], // Add 'preferred-import' next to old plugins
  rules: {
    // Add your rule config to rules
    'preferred-import/js-imports': ['error', {
      'ignoreParentDirectoryImport': true, // Ignore lint that reference the parent folder (../), default is false
      'ignoreCurrentDirectoryImport': true, // Ignore lint that reference the current folder (./), default is false
    }]
  }
}
```

# Supported Rules
* [`ts-imports`](https://github.com/ronparkdev/eslint-plugin-preferred-import/blob/master/documents/ts-imports.md) : Check for replaceable paths based on basePath, paths field in tsconfig.json. Auto-fixable

* [`js-imports`](https://github.com/ronparkdev/eslint-plugin-preferred-import/blob/master/documents/js-imports.md) : Check for replaceable paths based on rules config. Auto-fixable

# License
BSD License

[npm-image]: http://img.shields.io/npm/v/eslint-plugin-preferred-import.svg
[npm-url]: https://npmjs.org/package/eslint-plugin-preferred-import

[build-image]: http://img.shields.io/github/workflow/status/ronpark-dev/eslint-plugin-preferred-import/Build%20and%20unit%20test.svg
[build-url]: https://github.com/ronpark-dev/eslint-plugin-preferred-import/actions/workflows/ci.yml
