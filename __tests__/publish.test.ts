import { DatabaseQuestion } from '@ada-tech-br/questions'
import { publish } from '../src/lib/publish'

describe('publish', () => {
  it('publishes questions', async () => {
    const response = await publish({
      question: {} as DatabaseQuestion,
      token: 'tPVLGkPEY8gFLtgheBbNcI3PW8pBTNZj',
      url: 'https://admin-api.ada.tech/external/questions'
    })

    console.log(response)
  })
})
