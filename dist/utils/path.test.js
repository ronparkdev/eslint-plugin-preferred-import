"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const path_2 = require("./path");
describe('PathUtils', () => {
    describe('findPathOfMatchedFile', () => {
        beforeEach(() => {
            const dirItemsMap = {
                '/a/b': [{ isDirectory: () => false, name: 'fb.dat' }],
                '/a': [
                    { isDirectory: () => true, name: 'd' },
                    { isDirectory: () => false, name: 'fa.dat' },
                ],
                '/': [],
            };
            jest.spyOn(fs_1.default, 'readdirSync').mockImplementation((path) => dirItemsMap[path]);
            jest.spyOn(path_1.default, 'sep', 'get').mockImplementation(() => '/');
        });
        afterEach(() => {
            jest.spyOn(fs_1.default, 'readdirSync').mockRestore();
            jest.spyOn(path_1.default, 'sep', 'get').mockRestore();
        });
        test('Should find file in same directory', () => __awaiter(void 0, void 0, void 0, function* () {
            const currentPath = '/a';
            const matcher = '/a/fa.*';
            const result = (0, path_2.findPathOfMatchedFile)(currentPath, matcher);
            expect(result).toBe('/a/fa.dat');
        }));
        test('Should find file in parent directory', () => __awaiter(void 0, void 0, void 0, function* () {
            const currentPath = '/a/b';
            const matcher = '/a/fa.*';
            const result = (0, path_2.findPathOfMatchedFile)(currentPath, matcher);
            expect(result).toBe('/a/fa.dat');
        }));
        test('Should return null if no matched file', () => __awaiter(void 0, void 0, void 0, function* () {
            const currentPath = '/a/b';
            const matcher = '/a/dummy.*';
            const result = (0, path_2.findPathOfMatchedFile)(currentPath, matcher);
            expect(result).toBe(null);
        }));
    });
});
