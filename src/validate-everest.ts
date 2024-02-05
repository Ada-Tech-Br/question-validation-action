import {
  BlackboxQuestionSchema,
  DatabaseQuestion,
  WhiteboxQuestionSchema
} from '@ada-tech-br/questions'
import { IFileSystem } from './lib/file-system'
import { Err, Ok, Result } from 'cake-result'
import path from 'path'

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
    return validateBlackBox(files, filePath, fileContent)
  }

  const language = getWhiteboxExerciseLanguage(fileContent)
  const validateWhiteBoxFilesResult = validateWhiteBoxFiles(
    files,
    filePath,
    language
  )
  if (!validateWhiteBoxFilesResult.ok) {
    return Err({
      errors: validateWhiteBoxFilesResult.error,
      filePath
    })
  }

  const {
    descriptionFilePath,
    privateTestCasesFilePath,
    publicTestCasesFilePath
  } = validateWhiteBoxFilesResult.value

  const readDescriptionFileResult = fileSystem.readFile(descriptionFilePath)
  const readPublicTestCasesFileResult = fileSystem.readFile(
    publicTestCasesFilePath
  )
  const readPrivateTestCasesFileResult = fileSystem.readFile(
    privateTestCasesFilePath
  )

  if (
    !(
      readDescriptionFileResult.ok &&
      readPublicTestCasesFileResult.ok &&
      readPrivateTestCasesFileResult.ok
    )
  ) {
    const errors: string[] = []
    if (!readDescriptionFileResult.ok) {
      errors.push(readDescriptionFileResult.error)
    }
    if (!readPublicTestCasesFileResult.ok) {
      errors.push(readPublicTestCasesFileResult.error)
    }
    if (!readPrivateTestCasesFileResult.ok) {
      errors.push(readPrivateTestCasesFileResult.error)
    }

    return Err({ filePath, errors })
  }

  const whiteBoxValidationResult = WhiteboxQuestionSchema.safeParse({
    ...(fileContent as { [key: string]: unknown }),
    description: readDescriptionFileResult.value,
    publicTestCases: readPublicTestCasesFileResult.value,
    privateTestCases: readPrivateTestCasesFileResult.value,
    type: 'whitebox',
    language
  })

  if (!whiteBoxValidationResult.success) {
    return Err({
      filePath,
      errors: whiteBoxValidationResult.error.issues.map(
        ({ path: pathh, message }) =>
          (pathh.length ? [pathh.join('/')] : []).concat(message).join(': ')
      )
    })
  }

  return Ok({
    filePath,
    question: whiteBoxValidationResult.data
  })
}

function getWhiteboxExerciseLanguage(fileContent: unknown): string {
  const language = (fileContent as { language: string }).language
  const rempap: { [key: string]: string } = {
    java: 'java17'
  }

  return rempap[language] ?? language
}

function validateBlackBox(
  files: string[],
  filePath: string,
  fileContent: unknown
): Result<ValidationOutput, ValidationError> {
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
    privateTestCases: (fileContent as { private_cases: unknown }).private_cases
  })

  if (!blackBoxValidationResult.success) {
    return Err({
      filePath,
      errors: blackBoxValidationResult.error.issues.map(
        ({ path: pathh, message }) =>
          (pathh.length ? [pathh.join('/')] : []).concat(message).join(': ')
      )
    })
  }

  const question = blackBoxValidationResult.data

  if (Object.keys(question.templates).length <= 0) {
    return Err({
      errors: [`No templates found for exercise ${filePath}`],
      filePath
    })
  }

  return Ok({
    filePath,
    question: blackBoxValidationResult.data
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

function validateWhiteBoxFiles(
  files: string[],
  exerciseJsonPath: string,
  language: string
): Result<
  {
    descriptionFilePath: string
    privateTestCasesFilePath: string
    publicTestCasesFilePath: string
  },
  string[]
> {
  // find description file .MD
  const [pathToSearch] = exerciseJsonPath.split('.json')
  const descriptionFilePath =
    files.find(f => f.includes(`${pathToSearch}.md`)) ??
    files.find(f => f.endsWith(`.md`))
  const errors: string[] = []
  if (!descriptionFilePath) {
    errors.push(
      `No description file ${pathToSearch}.md found for exercise ${exerciseJsonPath}`
    )
  }

  let publicTestFileName = ''
  let privateTestFileName = ''

  switch (language) {
    case 'csharp': {
      publicTestFileName = 'TestCases.cs'
      privateTestFileName = 'PrivateTestCases.cs'
      break
    }
    case 'java17': {
      publicTestFileName = 'TestCases.java'
      privateTestFileName = 'PrivateTestCases.java'
      break
    }
    case 'javascript': {
      publicTestFileName = 'test_cases.test.js'
      privateTestFileName = 'test_cases_private.test.js'
      break
    }
    case 'nodejs': {
      publicTestFileName = 'test_cases.test.js'
      privateTestFileName = 'test_cases_private.test.js'
      break
    }
    case 'python': {
      publicTestFileName = 'test_cases.py'
      privateTestFileName = 'test_cases_private.py'
      break
    }
  }

  const publicTestCasesFilePath = files.find(
    f => !f.endsWith(privateTestFileName) && f.endsWith(publicTestFileName)
  )

  const privateTestCasesFilePath = files.find(f =>
    f.endsWith(privateTestFileName)
  )

  if (
    !privateTestCasesFilePath ||
    !publicTestCasesFilePath ||
    !descriptionFilePath
  ) {
    const dirname = path.dirname(exerciseJsonPath)

    if (!publicTestCasesFilePath) {
      errors.push(
        `No public test cases file ${path.posix.join(
          dirname,
          publicTestFileName
        )} found for exercise ${exerciseJsonPath}`
      )
    }
    if (!privateTestCasesFilePath) {
      errors.push(
        `No private test cases file ${path.posix.join(
          dirname,
          privateTestFileName
        )} found for exercise ${exerciseJsonPath}`
      )
    }
    return Err(errors)
  }

  return Ok({
    descriptionFilePath,
    privateTestCasesFilePath,
    publicTestCasesFilePath
  })
}
