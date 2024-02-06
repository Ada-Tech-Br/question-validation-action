import { publish } from '../src/lib/publish'

describe('publish', () => {
  it('publishes questions', async () => {
    const response = await publish({
      question: {
        id: 'c56a0845-58bb-4293-a3c8-acdb60367861',
        type: 'VF',
        language: 'NA',
        level: 'Basic',
        classification: [
          {
            knowledgeArea: 'DevOps',
            category: 'Pipelines de CI e CD AWS',
            subCategory: 'Infraestrutura AWS'
          }
        ],
        text: [
          'A AWS é uma das principais fornecedoras de infraestrutura as a service atualmente, superando empresas gigantes e já consolidadas, como o Google e a Microsoft. Sobre a AWS, assinale as alternativas corretas:'
        ],
        alternatives: [
          {
            id: '9f571f7b-a21d-4d37-9db9-7768701c8fd7',
            text: 'A AWS só fornece infraestrutura de máquinas virtuais, não é possível ter banco de dados ou armazenamento de arquivos lá.',
            feedback:
              'A AWS possui uma gama gigante de serviços, dentre eles: EC2 para máquinas virutais, RDS para bancos de dados relacionais, S3 para armazenamento de arquivos.',
            correct: false
          },
          {
            id: 'e6405280-2221-4580-89fa-1a0af510f2f8',
            text: 'É possível terceirizar toda a infraestrutura de uma empresa através da AWS.',
            feedback:
              'A AWS possui uma gama gigante de serviços, dentre eles: EC2 para máquinas virutais, RDS para bancos de dados relacionais, S3 para armazenamento de arquivos, entre muitos outros capazes de suprir todas as necessidades de uma empresa.',
            correct: true
          },
          {
            id: '534208b1-f7f1-442d-b1ef-9459f81974c5',
            text: 'A AWS disponibiliza uma modalidade free tier de cobrança para testes e experimentação da plataforma.',
            feedback:
              'A AWS disponibiliza uma modalidade free tier de cobrança para testes e experimentação da plataforma.',
            correct: true
          },
          {
            id: '6f93a271-d2ba-4507-a00d-b681d9a1cd44',
            text: 'O pacote free tier da AWS tem um tempo limitado e é limitado também a nível de recursos que podem ser utilizados.',
            feedback:
              'O free tier da AWS tem duração de 1 ano e alguns serviços (os mais caros, em geral) não estão disponíveis.',
            correct: true
          }
        ]
      },
      token: 'tPVLGkPEY8gFLtgheBbNcI3PW8pBTNZj',
      url: 'https://admin-api.ada.tech/external/questions'
    })

    expect(response.ok).toBe(true)
  })
})
