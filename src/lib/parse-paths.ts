import path from 'path'

export function parsePaths(paths: string[]): string[] {
  return paths.filter(file => file.endsWith('.json') || file.endsWith('.json"')).map(file => file.replace(/"/g, ''))
}