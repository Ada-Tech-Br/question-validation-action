/**
 * Unit tests for src/validate.ts
 */

import { validate } from '../src/validate'
import { expect } from '@jest/globals'
import { InMemoryFileSystem } from '../src/lib/file-system'
import { Err } from '../src/lib/result'
import * as validJSON from './data/valid.json'
const validfile = JSON.stringify(validJSON)

describe('validate', () => {
  let fileSystem: InMemoryFileSystem

  beforeEach(() => {
    const files = new Map<string, string>()
    files.set('/path/invalid.json', 'invalid json')
    files.set('/path/everest.json', '{ "type": "EVEREST" }')
    files.set('/path/some.json', '{ "type": "SOME_TYPE" }')
    files.set(
      '/path/valid.json',
      validfile
    )

    fileSystem = new InMemoryFileSystem(files)
  })

  it('should return an error if readFile fails', () => {
    const filePath = '/path/to/file'
    const result = validate(filePath, fileSystem)

    expect(result).toEqual(
      Err({
        errors: ['invalid path'],
        filePath
      })
    )
  })

  it('should return an error if parseToJSON fails', () => {
    const filePath = '/path/invalid.json'
    const result = validate(filePath, fileSystem)

    expect(result).toEqual(
      Err({
        filePath,
        errors: ['Invalid JSON in file /path/invalid.json']
      })
    )
  })

  it('should return an error if the type is EVEREST', () => {
    const filePath = '/path/everest.json'
    const result = validate(filePath, fileSystem)

    expect(result).toEqual(
      Err({
        errors: ['EVEREST is not a supported type (yet)'],
        filePath
      })
    )
  })

  it('should return an error if the json is invalid', () => {
    const filePath = '/path/some.json'
    const result = validate(filePath, fileSystem)

    expect(result.ok).toBe(false)
  })

  it('should return ok if the file is valid', () => {
    const filePath = '/path/valid.json'
    const result = validate(filePath, fileSystem)

    expect(result.ok).toBe(true)
  })
})
