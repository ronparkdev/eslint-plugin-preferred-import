# eslint-plugin-preferred-import/js-imports
Check for replaceable to absolute paths. Auto-fixable.
Before applying it, you have to set up `webpack resolve alias` and apply the same to the `resolveAlias` option. (Read this document : https://webpack.js.org/configuration/resolve/#resolvealias)

## Example
Suppose that your project is organized as below
```
package.json
.eslintrc.js
/src
└ standalone.ts <- referenced file
└ /utils
  └ foo.ts <- referenced file
└ /service
  └ main.ts <- linting file
```

And suppose that your **.eslintrc.js** is similar to below 
```javascript
const path = require('path')

module.exports = {
  plugins: [..., 'preferred-import'], // Add 'preferred-import' next to old plugins
  rules: {
	  ...,
    // Add the below rules next to the old rules
    'preferred-import/js-imports': ['error', {
      'resolveAlias': {
        'standalone$': path.resolve(__dirname, 'src/standalone'),
        'utils': path.resolve(__dirname, 'src/utils'),
        'service': path.resolve(__dirname, 'src/service'),
      },
    }],
  }
}
```

If it is the above situation, it will lint as below

### Before apply rule
```javascript
import Standalone from '../standalone'
import FooUtil from '../utils/foo'
import BarService from './bar'
```

### After applying the rule (Autofix by lint)
```javascript
import Standalone from 'standalone'
import FooUtil from 'utils/foo'
import BarService from 'service/bar'
```

## Options

### `resolveAlias`: 
* Ignore lint for import of parent folder reference (`../`)
* This value should match with the webpack alias (Read this document : https://webpack.js.org/configuration/resolve/#resolvealias)
* default is `{}`

### `ignoreCurrentDirectoryImport` : 
* Ignore lint for import of current folder reference (`./`)
* default is `true`
