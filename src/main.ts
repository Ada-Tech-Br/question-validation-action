import * as core from '@actions/core'
import z from 'zod'

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
}
