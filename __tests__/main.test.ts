/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let getInputMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance

process.env['INPUT_PUBLISH'] = 'false'

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
  })

  it('validates file paths provided by the input', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'INPUT_FILES':
          return '["file1.json", "file2.json"]'
        case 'PUBLISH':
          return 'false'
        default:
          throw new Error(`Unknown input: ${name}`)
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledTimes(1)
  })
})
