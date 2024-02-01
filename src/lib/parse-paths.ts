import path from 'path'

export function parsePaths(paths: string[]): string[] {
  return paths
    .filter(file => file.endsWith('.json') || file.endsWith('.json"'))
    .map(file => normalizePath(file.replace(/"/g, '')))
}

export function normalizePath(input: string): string {
  let decodedPath = Buffer.from(input, 'utf-8').toString();

  return decodedPath
}
