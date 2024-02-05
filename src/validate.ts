import {
  DatabaseQuestionSchema,
  DatabaseQuestion
} from '@ada-tech-br/questions'
import { IFileSystem } from './lib/file-system'
import { Err, Ok, Result } from 'cake-result'
import { validateEverest } from './validate-everest'

type ValidationError = {
  filePath: string
  errors: string[]
}

type ValidationOutput = {
  filePath: string
  question: DatabaseQuestion
}

export function validate(
  filePath: string,
  fileSystem: IFileSystem
): Result<ValidationOutput, ValidationError> {
  const readFileResult = fileSystem.readFile(filePath)
  if (!readFileResult.ok)
    return Err({
      errors: [readFileResult.error],
      filePath
    })

  const parseToJSONResult = parseToJSON(filePath, readFileResult.value)
  if (!parseToJSONResult.ok)
    return Err({
      errors: [parseToJSONResult.error],
      filePath
    })

  if ((parseToJSONResult.value as { type: string }).type === 'EVEREST') {
    return validateEverest(filePath, parseToJSONResult.value, fileSystem)
  }

  const validationResult = DatabaseQuestionSchema.safeParse(
    parseToJSONResult.value
  )

  if (!validationResult.success) {
    return Err({
      filePath,
      errors: validationResult.error.issues.map(({ path, message }) =>
        (path.length ? [path.join('/')] : []).concat(message).join(': ')
      )
    })
  }

  return Ok({
    filePath,
    question: validationResult.data
  })
}

function parseToJSON(
  filePath: string,
  fileContent: string
): Result<unknown, string> {
  try {
    return Ok(JSON.parse(fileContent))
  } catch (error) {
    return Err(`Invalid JSON in file ${filePath}`)
  }
}
