import { dirname, join } from 'path'
import { Err, Ok, Result } from './result'
import { existsSync, lstatSync, readFileSync, readdirSync } from 'fs'

export interface IFileSystem {
  readFile(filePath: string): Result<string, string>
  listFilesInSameDirectory(filePath: string): Result<string[], string>
}

export class InMemoryFileSystem implements IFileSystem {
  constructor(private readonly files: Map<string, string>) {}

  readFile(filePath: string): Result<string, string> {
    const fileContent = this.files.get(filePath)
    if (fileContent) {
      return Ok(fileContent)
    } else {
      return Err('invalid path')
    }
  }

  listFilesInSameDirectory(filePath: string): Result<string[], string> {
    const entries = Array.from(this.files.entries())
    const filesInSameDirectory = entries
      .filter(([path]) => {
        const directory = dirname(filePath)
        return path.startsWith(directory)
      })
      .map(([path]) => path)

    return Ok(filesInSameDirectory)
  }
}

export class FsFileSystem implements IFileSystem {
  readFile(filePath: string): Result<string, string> {
    if (existsSync(filePath) && lstatSync(filePath).isFile()) {
      return Ok(readFileSync(filePath, 'utf-8'))
    } else {
      return Err('invalid path')
    }
  }

  listFilesInSameDirectory(filePath: string): Result<string[], string> {
    const directory = dirname(filePath)
    const files = readdirSync(directory).map(f => join(directory, f))

    return Ok(files)
  }
}
