import * as core from '@actions/core'
import z from 'zod'
import { validate } from './validate'
import { FsFileSystem } from './lib/file-system'
import { InferErrResult, InferOkResult } from './lib/result'
import { parsePaths } from './lib/parse-paths'

const fileSystem = new FsFileSystem()

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
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
}
