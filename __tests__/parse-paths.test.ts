import { normalizePath, parsePaths } from '../src/lib/parse-paths'

const sample = [
  'folder/path/file.json',
  'BD-Banco-de-Dados/BD-PO-001 BANCO DE DADOS (POSTGRES)/Exerc\\303\\255cios/bd-po-001_23.json',
  'folder/path/file.md'
]

describe('parsePaths', () => {
  it('should parse paths with space', () => {
    const result = parsePaths(sample)

    expect(result).toEqual([
      'folder/path/file.json',
      'BD-Banco-de-Dados/BD-PO-001 BANCO DE DADOS (POSTGRES)/Exercícios/bd-po-001_23.json'
    ])
  })
})

describe('normalizePath', () => {
  it('should decode path', () => {
    const result = normalizePath(
      'BD-Banco-de-Dados/BD-PO-001 BANCO DE DADOS (POSTGRES)/Exerc\\303\\255cios/bd-po-001_09.json'
    )

    expect(result).toEqual(
      'BD-Banco-de-Dados/BD-PO-001 BANCO DE DADOS (POSTGRES)/Exercícios/bd-po-001_09.json'
    )
  })
})
