# eslint-plugin-preferred-import/ts-imports

Auto-fixes relative paths to tsconfig path aliases.

## Configuration

```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['preferred-import'],
  overrides: [{
    files: ['src/**/*.{ts,tsx}'],
    parserOptions: {
      project: ['./tsconfig.json']
    },
    rules: {
      'preferred-import/ts-imports': 'error'
    }
  }]
}

// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@standalone": ["./standalone"],
      "@utils/*": ["./utils/*"]
    }
  }
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
import Standalone from '@standalone'
import FooUtil from '@utils/foo'
export { Bar } from '@bar'
```

## Options

- `ignoreCurrentDirectoryImport`: Skip `./` imports (default: `true`)
