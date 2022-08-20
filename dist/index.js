'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const js_imports_1 = __importDefault(require("./rules/js-imports"));
const ts_imports_1 = __importDefault(require("./rules/ts-imports"));
module.exports.rules = {
    'ts-imports': ts_imports_1.default,
    'js-imports': js_imports_1.default,
};
