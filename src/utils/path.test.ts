import fs from 'fs'
import path from 'path'

import { findPathOfMatchedFile } from './path'

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
      }
      jest.spyOn(fs, 'readdirSync').mockImplementation((path: string) => dirItemsMap[path])
      jest.spyOn(path, 'sep', 'get').mockImplementation(() => '/')
    })

    afterEach(() => {
      jest.spyOn(fs, 'readdirSync').mockRestore()
      jest.spyOn(path, 'sep', 'get').mockRestore()
    })

    test('Should find file in same directory', async () => {
      // given
      const currentPath = '/a'
      const matcher = '/a/fa.*'

      // when
      const result = findPathOfMatchedFile(currentPath, matcher)

      // then
      expect(result).toBe('/a/fa.dat')
    })

    test('Should find file in parent directory', async () => {
      // given
      const currentPath = '/a/b'
      const matcher = '/a/fa.*'

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
