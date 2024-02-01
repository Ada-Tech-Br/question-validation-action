import { DatabaseQuestion } from '@ada-tech-br/questions'
import { Err, Ok, Result } from './lib/result'

export type PublishOptions = {
  token: string
  url: string
}

export async function publish(
  question: DatabaseQuestion,
  options: PublishOptions
): Promise<Result<string, string>> {
  try {
    const result = await fetch(options.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${options.token}`
      }
    })

    if (!result.ok) {
      return Err(`Error while publishing question ${question.id}`)
    }

    return Ok(`Question ${question.id} published`)
  } catch (error) {
    return Err(`Error while publishing question ${question.id}`)
  }
}
