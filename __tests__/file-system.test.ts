import { InMemoryFileSystem } from '../src/lib/file-system'
import { Ok, Err } from 'cake-result'

describe('InMemoryFileSystem', () => {
  let fileSystem: InMemoryFileSystem

  beforeEach(() => {
    const files = new Map<string, string>()
    files.set('/path/to/file1.txt', 'File 1 content')
    files.set('/path/to/file2.txt', 'File 2 content')
    files.set('/path/to/subdirectory/file3.txt', 'File 3 content')

    fileSystem = new InMemoryFileSystem(files)
  })

  describe('readFile', () => {
    it('should return the content of an existing file', () => {
      const result = fileSystem.readFile('/path/to/file1.txt')
      expect(result).toEqual(Ok('File 1 content'))
    })

    it('should return an error for an invalid file path', () => {
      const result = fileSystem.readFile('/path/to/nonexistent.txt')
      expect(result).toEqual(Err('invalid path'))
    })
  })

  describe('listFilesInSameDirectory', () => {
    it('should return a list of files in the same directory', () => {
      const result = fileSystem.listFilesInSameDirectory('/path/to')
      expect(result).toEqual(
        Ok([
          '/path/to/file1.txt',
          '/path/to/file2.txt',
          '/path/to/subdirectory/file3.txt'
        ])
      )
    })

    it('should return an empty list for a directory with no files', () => {
      const result = fileSystem.listFilesInSameDirectory('/adorobolo/mano')
      expect(result).toEqual(Ok([]))
    })
  })
})
