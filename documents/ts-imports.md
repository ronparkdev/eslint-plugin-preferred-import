# eslint-plugin-preferred-import/ts-imports
Check for replaceable paths based on basePath, paths field in tsconfig.json. Auto-fixable

# Usage
Here’s a suggested ESLint configuration:
```javascript
{
  parser: '@typescript-eslint/parser', // Should be used ts-eslint parser
  plugins: [..., 'preferred-import'], // Add 'preferred-import' next to old plugins
  parserOptions: {
    project: ['./tsconfig.json'], // Add your relative path of tsconfig
  },
  rules: {
	  ...,
    // Add the below rules next to the old rules
    'preferred-import/ts-imports': ['error', {
      'ignoreCurrentDirectoryImport': true, // Ignore lint for import of current folder reference (./), default is false
    }],
  }
}
```
You have to set up `parser` and `parserOptions.project` to read your tsconfig.json. 

## Example
Suppose that your project is organized as below
```
package.json
eslintrc.json
tsconfig.json
/src
└ standalone.ts <- referenced file
└ /utils
  └ foo.ts <- referenced file
└ /service
  └ main.ts <- linting file
  └ bar.ts <- referenced file
```

And suppose that your **tsconfig.json** is similar to below 
```
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@standalone": ["./standalone"],
      "@utils/*": ["./utils/*"],
      "@service/*": ["./service/*"],
    }
  },
  "include": ["src"]
}
```

If it is the above situation, it will lint as below

### Before apply the rule
```javascript
import Standalone from '../standalone'
import FooUtil from '../utils/foo'
import BarService from './bar'
```

### After applying the rule (Autofix by lint)
```javascript`
import Standalone from '@standalone'
import FooUtil from '@utils/foo'
import BarService from '@service/bar'
```

## Options

### `ignoreParentDirectoryImport`: 
* Ignore lint for import of parent folder reference (`../`)
* default is `false`

### `ignoreCurrentDirectoryImport` : 
* Ignore lint for import of current folder reference (`./`)
* default is `false`

## Notes
In general, Import of current folder reference (./) is an important meaning for a relation between current logic and child logic. So, suggest that turn off `ignoreCurrentDirectoryImport` option for it.