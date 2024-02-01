import {
  DatabaseQuestionSchema,
  BlackboxQuestionFileSchema,
  WhiteboxQuestionFileSchema
} from '@ada-tech-br/questions'
import { IFileSystem } from './lib/file-system'
import { Err, Ok, Result } from 'cake-result'

type ValidationError = {
  filePath: string
  errors: string[]
}

export function validate(
  filePath: string,
  fileSystem: IFileSystem
): Result<
  {
    filePath: string
  },
  ValidationError
> {
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
    const whiteboxResult = WhiteboxQuestionFileSchema.safeParse(
      parseToJSONResult.value
    )
    const blackboxResult = BlackboxQuestionFileSchema.safeParse(
      parseToJSONResult.value
    )

    if (!whiteboxResult.success && !blackboxResult.success) {
      const whiteboxErrors = whiteboxResult.error.issues.map(
        ({ path, message }) =>
          (path.length ? [path.join('/')] : []).concat(message).join(': ')
      )

      const blackboxErrors = blackboxResult.error.issues.map(
        ({ path, message }) =>
          (path.length ? [path.join('/')] : []).concat(message).join(': ')
      )

      return Err({
        filePath,
        errors: whiteboxErrors.concat(blackboxErrors)
      })
    }
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
    filePath
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
