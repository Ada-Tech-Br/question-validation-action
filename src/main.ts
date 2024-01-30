import * as core from '@actions/core'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  const rawInputFiles = core.getInput('INPUT_FILES', { required: true })

  core.info(`The raw input files are: ${rawInputFiles}`)
}
