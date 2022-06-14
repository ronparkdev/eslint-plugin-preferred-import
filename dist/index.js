'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prefer_ts_paths_imports_1 = __importDefault(require("./rules/prefer-ts-paths-imports"));
const no_relative_path_imports_1 = __importDefault(require("./rules/no-relative-path-imports"));
module.exports.rules = {
    'prefer-ts-paths-imports': prefer_ts_paths_imports_1.default,
    'no-relative-path-imports': no_relative_path_imports_1.default,
};
