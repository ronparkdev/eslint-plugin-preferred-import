# eslint-plugin-preferred-import/js-imports

Auto-fixes relative paths to webpack alias paths.

## Configuration

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['preferred-import'],
  rules: {
    'preferred-import/js-imports': [
      'error',
      {
        resolveAlias: {
          utils: path.resolve(__dirname, 'src/utils'),
          standalone$: path.resolve(__dirname, 'src/standalone'),
        },
      },
    ],
  },
}
```

## Example

```
src/
├── standalone.ts
├── utils/
│   └── foo.ts
└── service/
    └── main.ts
```

Before:

```javascript
import Standalone from '../standalone'
import FooUtil from '../utils/foo'
export { Bar } from '../bar'
```

After:

```javascript
import Standalone from 'standalone'
import FooUtil from 'utils/foo'
export { Bar } from 'bar'
```

## Options

- `resolveAlias`: Webpack alias paths (default: `{}`)
- `ignoreCurrentDirectoryImport`: Skip `./` imports (default: `true`)
