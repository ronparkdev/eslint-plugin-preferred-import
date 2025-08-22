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
        let originalSep;
        beforeEach(() => {
            const dirItemsMap = {
                '/a/b': [{ isDirectory: () => false, name: 'fb.dat' }],
                '/a': [
                    { isDirectory: () => true, name: 'd' },
                    { isDirectory: () => false, name: 'fa.dat' },
                ],
                '/': [],
            };
            jest.spyOn(fs_1.default, 'readdirSync').mockImplementation((dirPath) => {
                return dirItemsMap[dirPath.toString()].map((item) => item.name);
            });
            originalSep = path_1.default.sep;
            Object.defineProperty(path_1.default, 'sep', {
                value: '/',
                writable: true,
                configurable: true,
            });
        });
        afterEach(() => {
            jest.spyOn(fs_1.default, 'readdirSync').mockRestore();
            Object.defineProperty(path_1.default, 'sep', {
                value: originalSep,
                writable: true,
                configurable: true,
            });
        });
        test('Should find file in same directory', () => __awaiter(void 0, void 0, void 0, function* () {
            const currentPath = '/a';
            const matcher = 'fa.*';
            const result = (0, path_2.findPathOfMatchedFile)(currentPath, matcher);
            expect(result).toBe('/a/fa.dat');
        }));
        test('Should find file in parent directory', () => __awaiter(void 0, void 0, void 0, function* () {
            const currentPath = '/a/b';
            const matcher = 'fa.*';
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
