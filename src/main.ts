import * as core from '@actions/core'
import z from 'zod'
import { validate } from './validate'
import { FsFileSystem } from './lib/file-system'

const fileSystem = new FsFileSystem()

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  const rawInputFiles = core.getInput('INPUT_FILES', { required: true })

  const input = z.array(z.string()).parse(JSON.parse(rawInputFiles))
  const jsonFiles = input.filter(file => file.endsWith('.json'))

  core.info(`Found ${input.length} files.`)
  core.info(`Found ${jsonFiles.length} JSON files.`)

  const results = jsonFiles.map(filePath => validate(filePath, fileSystem))

  for (const result of results) {
    if (result.ok) {
      core.info(`✅ ${result.value.filePath} is valid.`)
      continue
    }
    core.error(`❌ ${result.error.filePath} is invalid:`)
    for (const error of result.error.errors) {
      core.error(`  - ${error}`)
    }
  }
}
