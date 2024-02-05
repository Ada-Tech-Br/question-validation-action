import {
  BlackboxQuestionSchema,
  DatabaseQuestion
} from '@ada-tech-br/questions'
import { IFileSystem } from './lib/file-system'
import { Err, Ok, Result } from 'cake-result'

type ValidationError = {
  filePath: string
  errors: string[]
}

type ValidationOutput = {
  filePath: string
  question: DatabaseQuestion
}

export function validateEverest(
  filePath: string,
  fileContent: unknown,
  fileSystem: IFileSystem
): Result<ValidationOutput, ValidationError> {
  const type = (fileContent as { type: string }).type
  if (type !== 'EVEREST') {
    return Err({
      errors: [`Not a everest exercise file expected "EVEREST". Got: ${type}`],
      filePath
    })
  }
  const listFilesResult = fileSystem.listFilesInSameDirectory(filePath)
  if (!listFilesResult.ok) {
    return Err({
      filePath,
      errors: [listFilesResult.error]
    })
  }

  const files = listFilesResult.value

  const exerciseType = getExerciseType(fileContent)

  if (exerciseType === 'blackbox') {
    const validateBlackBoxFilesResult = validateBlackBoxFiles(files, filePath)
    if (!validateBlackBoxFilesResult.ok) {
      return Err({
        errors: [validateBlackBoxFilesResult.error],
        filePath
      })
    }

    const { descriptionFilePath } = validateBlackBoxFilesResult.value

    const blackBoxValidationResult = BlackboxQuestionSchema.safeParse({
      ...(fileContent as { [key: string]: unknown }),
      description: descriptionFilePath,
      type: 'blackbox',
      publicTestCases: (fileContent as { public_cases: unknown }).public_cases,
      privateTestCases: (fileContent as { private_cases: unknown })
        .private_cases
    })

    if (!blackBoxValidationResult.success) {
      return Err({
        filePath,
        errors: blackBoxValidationResult.error.issues.map(({ path, message }) =>
          (path.length ? [path.join('/')] : []).concat(message).join(': ')
        )
      })
    }

    return Ok({
      filePath,
      question: blackBoxValidationResult.data
    })
  }

  return Err({
    filePath,
    errors: [`Not a everest exercise file expected "EVEREST". Got: ${type}`]
  })
}

function getExerciseType(fileContent: unknown): 'blackbox' | 'whitebox' {
  if (
    typeof fileContent === 'object' &&
    fileContent &&
    Object.hasOwn(fileContent, 'public_cases') &&
    Object.hasOwn(fileContent, 'private_cases')
  )
    return 'blackbox'
  return 'whitebox'
}

function validateBlackBoxFiles(
  files: string[],
  exerciseJsonPath: string
): Result<{ descriptionFilePath: string }, string> {
  const [pathToSearch] = exerciseJsonPath.split('.json')

  const descriptionFilePath =
    files.find(f => f.includes(`${pathToSearch}.md`)) ??
    files.find(f => f.endsWith(`.md`))
  if (!descriptionFilePath) {
    return Err(
      `No description file ${pathToSearch}.md found for exercise ${exerciseJsonPath}`
    )
  }

  return Ok({ descriptionFilePath })
}
