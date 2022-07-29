# eslint-plugin-preferred-import

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
      'ignoreChildPathImport': false, // ignore lint of ./ included import, (default is true)
    }]
  }
}
```

## no-relative-path-imports
The rule that autofixes the absolute path if using relative paths `../` and `./`

### Options
* allowParentPathImport : Whether to allow ../ (default: false)
* allowChildPathImport : Whether to allow ./ (default: false)

### Configuration Guide
You need setup .eslintrc.js or .eslintrc.json in your project
```js
module.exports = {
  plugins: ['preferred-import'], // Add 'preferred-import' plugin to plugins
  rules: {
    // Add your rule config to rules
    'preferred-import/no-relative-path-imports': ['error', {
      'disallowParentPathImport': true, // do lint of ../ included import, (default is true)
      'disallowChildPathImport': true, // do lint of ./ included import, (default is false)
    }]
  }
}
```

