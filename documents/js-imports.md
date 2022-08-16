# eslint-plugin-preferred-import/js-imports
Check for replaceable to absolute paths. Auto-fixable.

# Usage
Here’s a suggested ESLint configuration:
```javascript
{
  plugins: [..., 'preferred-import'], // Add 'preferred-import' next to old plugins
  rules: {
	  ...,
    // Add the below rules next to the old rules
    'preferred-import/js-imports': ['error', {
      'ignoreCurrentDirectoryImport': true, // Ignore lint for import of current folder reference (./), default is false
    }],
  }
}
```

## Example
Suppose that your project is organized as below
```
package.json
eslintrc.json
/src
└ standalone.ts <- referenced file
└ /utils
  └ foo.ts <- referenced file
└ /service
  └ main.ts <- linting file
```

If it is the above situation, it will lint as below

### Before apply rule
```javascript
import Standalone from '../standalone'
import FooUtil from '../utils/foo'
import BarService from './bar'
```

### After applying the rule (Autofix by lint)
```javascript`
import Standalone from 'src/standalone'
import FooUtil from 'src/utils/foo'
import BarService from 'src/service/bar'
```

## Options

### `ignoreParentDirectoryImport`: 
* Ignore lint for import of parent folder reference (`../`)
* default is `false`

### `ignoreCurrentDirectoryImport` : 
* Ignore lint for import of current folder reference (`./`)
* default is `false`

## Notes
Import path is 