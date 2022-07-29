'use strict'
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const no_relative_path_imports_1 = __importDefault(require('./rules/no-relative-path-imports'))
const prefer_ts_paths_imports_1 = __importDefault(require('./rules/prefer-ts-paths-imports'))
module.exports.rules = {
  'prefer-ts-paths-imports': prefer_ts_paths_imports_1.default,
  'no-relative-path-imports': no_relative_path_imports_1.default,
}
