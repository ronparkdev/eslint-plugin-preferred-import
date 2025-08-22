import fs, { Dirent, PathLike } from 'fs'
import path from 'path'

import { findPathOfMatchedFile } from './path'

describe('PathUtils', () => {
  describe('findPathOfMatchedFile', () => {
    let originalSep: string

    beforeEach(() => {
      const dirItemsMap = {
        '/a/b': [{ isDirectory: () => false, name: 'fb.dat' }],
        '/a': [
          { isDirectory: () => true, name: 'd' },
          { isDirectory: () => false, name: 'fa.dat' },
        ],
        '/': [],
      }
      jest.spyOn(fs, 'readdirSync').mockImplementation((dirPath: PathLike) => {
        return dirItemsMap[dirPath.toString() as keyof typeof dirItemsMap].map(
          (item) => item as unknown as Dirent<Buffer<ArrayBufferLike>>,
        )
      })

      originalSep = path.sep
      Object.defineProperty(path, 'sep', {
        value: '/',
        writable: true,
        configurable: true,
      })
    })

    afterEach(() => {
      jest.spyOn(fs, 'readdirSync').mockRestore()
      Object.defineProperty(path, 'sep', {
        value: originalSep,
        writable: true,
        configurable: true,
      })
    })

    test('Should find file in same directory', async () => {
      // given
      const currentPath = '/a'
      const matcher = 'fa.*'

      // when
      const result = findPathOfMatchedFile(currentPath, matcher)

      // then
      expect(result).toBe('/a/fa.dat')
    })

    test('Should find file in parent directory', async () => {
      // given
      const currentPath = '/a/b'
      const matcher = 'fa.*'

      // when
      const result = findPathOfMatchedFile(currentPath, matcher)

      // then
      expect(result).toBe('/a/fa.dat')
    })

    test('Should return null if no matched file', async () => {
      // given
      const currentPath = '/a/b'
      const matcher = '/a/dummy.*'

      // when
      const result = findPathOfMatchedFile(currentPath, matcher)

      // then
      expect(result).toBe(null)
    })
  })
})
