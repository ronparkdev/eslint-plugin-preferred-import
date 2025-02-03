# eslint-plugin-preferred-import

[![NPM version][npm-image]][npm-url] [![Build Status][build-image]][build-url]

ESLint plugin that converts relative imports to alias paths from tsconfig.json or webpack config. Supports auto-fixing.

![1664534016](https://user-images.githubusercontent.com/47266692/193251941-8a881625-971e-4abe-ae52-6f92d6a0ef94.gif)

## Install

```bash
npm i eslint eslint-plugin-preferred-import --save-dev
```

## Usage

### TypeScript Projects (`ts-imports`)

```javascript
{
  parser: '@typescript-eslint/parser',
  plugins: ['preferred-import'],
  overrides: [{
    files: ['src/**/*.{ts,tsx}'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: ['./tsconfig.json']
    },
    rules: {
      'preferred-import/ts-imports': 'error'
    }
  }]
}
```

### JavaScript Projects (`js-imports`)

```javascript
const path = require('path')

module.exports = {
  plugins: ['preferred-import'],
  rules: {
    'preferred-import/js-imports': [
      'error',
      {
        resolveAlias: {
          utils: path.resolve(__dirname, 'src/utils'),
          reducer$: path.resolve(__dirname, 'src/reducer'),
        },
      },
    ],
  },
}
```

## Rules

- [`ts-imports`](./documents/ts-imports.md): Converts paths based on tsconfig.json
- [`js-imports`](./documents/js-imports.md): Converts paths based on webpack aliases

## License

BSD License

[npm-image]: http://img.shields.io/npm/v/eslint-plugin-preferred-import.svg
[npm-url]: https://npmjs.org/package/eslint-plugin-preferred-import
[build-image]: http://img.shields.io/github/workflow/status/ronpark-dev/eslint-plugin-preferred-import/Build%20and%20unit%20test.svg
[build-url]: https://github.com/ronpark-dev/eslint-plugin-preferred-import/actions/workflows/ci.yml
