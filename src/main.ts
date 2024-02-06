import * as core from '@actions/core'
import z from 'zod'
import { FsFileSystem, IFileSystem, validate } from '@ada-tech-br/questions'
import { InferErrResult, InferOkResult } from 'cake-result'
import { parsePaths } from './lib/parse-paths'
import { publish } from './lib/publish'

const DEFAULT_FILE_SYSTEM = new FsFileSystem()
const ADA_ADMIN_TOKEN = process.env.ADA_ADMIN_TOKEN
const ADA_ADMIN_PUBLISH_QUESTION_URL =
  process.env.ADA_ADMIN_PUBLISH_QUESTION_URL

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(
  fileSystem: IFileSystem = DEFAULT_FILE_SYSTEM
): Promise<void> {
  const shouldPublish = core.getBooleanInput('PUBLISH', { required: false })
  const rawInputFiles = core.getInput('INPUT_FILES', { required: true })

  const input = z.array(z.string()).parse(JSON.parse(rawInputFiles))
  const jsonFiles = parsePaths(input)

  core.info(`Found ${input.length} files.`)
  core.info(`Found ${jsonFiles.length} JSON files.`)

  const results = jsonFiles.map(filePath => validate(filePath, fileSystem))
  const errors = results.filter(
    (result): result is InferErrResult<ReturnType<typeof validate>> =>
      !result.ok
  )

  const okResults = results.filter(
    (result): result is InferOkResult<ReturnType<typeof validate>> => result.ok
  )

  core.info(`Found ${errors.length} invalid files.`)
  core.info(`Found ${okResults.length} valid files.`)

  for (const validFile of okResults) {
    core.info(`✅ ${validFile.value.filePath} is valid.`)
  }

  for (const error of errors) {
    core.error(`❌ ${error.error.filePath} is invalid:`)
    for (const errorMessage of error.error.errors) {
      core.error(`  - ${errorMessage}`)
    }
  }

  if (errors.length > 0) {
    core.setFailed(`Found ${errors.length} invalid files.`)
  }

  if (!shouldPublish || okResults.length <= 0) {
    return
  }

  if (!ADA_ADMIN_TOKEN || !ADA_ADMIN_PUBLISH_QUESTION_URL) {
    if (!ADA_ADMIN_TOKEN) {
      core.setFailed('Missing environment variable: ADA_ADMIN_TOKEN')
    }
    if (!ADA_ADMIN_PUBLISH_QUESTION_URL) {
      core.setFailed(
        'Missing environment variable: ADA_ADMIN_PUBLISH_QUESTION_URL'
      )
    }
    return
  }

  core.info(`Publishing ${okResults.length} valid files to question bank.`)
  core.info(`Using token: ${ADA_ADMIN_TOKEN}`)

  const batch = okResults.map(
    result => async () =>
      await publish({
        question: result.value.question,
        token: ADA_ADMIN_TOKEN,
        url: ADA_ADMIN_PUBLISH_QUESTION_URL
      })
  )

  const resultsOfPublish = await Promise.all(batch.map(async fn => await fn()))

  const errorsOfPublish = resultsOfPublish.filter(
    (result): result is InferErrResult<Awaited<ReturnType<typeof publish>>> =>
      !result.ok
  )

  const okResultsOfPublish = resultsOfPublish.filter(
    (result): result is InferOkResult<Awaited<ReturnType<typeof publish>>> =>
      result.ok
  )

  core.info(`Published ${okResultsOfPublish.length} valid files.`)
  core.info(`Failed to publish ${errorsOfPublish.length} valid files.`)

  for (const okResult of okResultsOfPublish) {
    core.info(`✅ Published question ${okResult.value.question.id}.`)
  }

  for (const error of errorsOfPublish) {
    core.error(`❌ Failed to publish question ${error.error.question.id}:`)
    core.error(JSON.stringify(error.error.error))
  }

  if (errorsOfPublish.length > 0) {
    core.setFailed(`Failed to publish ${errorsOfPublish.length} valid files.`)
  }
}
