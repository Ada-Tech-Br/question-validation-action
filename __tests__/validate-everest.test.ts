import { validateEverest } from '../src/validate-everest'
import { InMemoryFileSystem } from '../src/lib/file-system'
import { Err, InferErrResult } from 'cake-result'
import { readFileSync } from 'fs'
import path from 'path'

const validfile = readFileSync(
  path.join(__dirname, './data/blackbox.json'),
  'utf-8'
)

const whiteboxExerciseFile = readFileSync(
  path.join(__dirname, './data/whitebox/be_jv_002_02.json'),
  'utf-8'
)

describe('validateEverest', () => {
  let fileSystem: InMemoryFileSystem

  beforeEach(() => {
    const files = new Map<string, string>()
    files.set('/path/mult.json', '{ type: "GAP" }')
    files.set('/path/java/markdown/exercise.json', validfile)
    files.set('/path/java/valid.json', validfile)
    files.set('/path/java/valid.md', '## this is a markdown file')
    files.set('/path/java/whitebox/valid.json', whiteboxExerciseFile)
    files.set('/path/java/whitebox/markdown/valid.json', whiteboxExerciseFile)

    fileSystem = new InMemoryFileSystem(files)
  })

  it('should return an error if the JSON is invalid', () => {
    const filePath = '/path/mult.json'
    const result = validateEverest(filePath, { type: 'GAP' }, fileSystem)

    expect(result).toEqual(
      Err({
        filePath,
        errors: ['Not a everest exercise file expected "EVEREST". Got: GAP']
      })
    )
  })

  describe('blackbox', () => {
    it('should validate a missing blackbox exercise description', () => {
      const filePath = '/path/java/markdown/exercise.json'
      const result = validateEverest(
        filePath,
        JSON.parse(validfile),
        fileSystem
      )

      expect(result).toEqual(
        Err({
          filePath,
          errors: [
            `No description file /path/java/markdown/exercise.md found for exercise /path/java/markdown/exercise.json`
          ]
        })
      )
    })

    it('should validate missing templates', () => {
      const filePath = '/path/java/valid.json'
      const content = JSON.parse(validfile)
      content.templates = {}

      const result = validateEverest(filePath, content, fileSystem)
      expect(result).toEqual(
        Err({
          filePath,
          errors: [`No templates found for exercise /path/java/valid.json`]
        })
      )
    })

    it('should validate a blackbox exercise', () => {
      const filePath = '/path/java/valid.json'
      const result = validateEverest(
        filePath,
        JSON.parse(validfile),
        fileSystem
      )
      expect(result.ok).toBe(true)
    })
  })

  describe('whitebox', () => {
    it('should validate missing text files', () => {
      const filePath = '/path/java/whitebox/markdown/valid.json'
      const result = validateEverest(
        filePath,
        JSON.parse(whiteboxExerciseFile),
        fileSystem
      ) as InferErrResult<ReturnType<typeof validateEverest>>

      expect(result.ok).toBe(false)
      expect(result.error.errors).toContain(
        'No description file /path/java/whitebox/markdown/valid.md found for exercise /path/java/whitebox/markdown/valid.json'
      )
      expect(result.error.errors).toContain(
        'No public test cases file /path/java/whitebox/markdown/TestCases.java found for exercise /path/java/whitebox/markdown/valid.json'
      )
      expect(result.error.errors).toContain(
        'No private test cases file /path/java/whitebox/markdown/PrivateTestCases.java found for exercise /path/java/whitebox/markdown/valid.json'
      )
    })
  })
})
