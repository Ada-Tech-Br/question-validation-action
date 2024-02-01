import path from 'path'

export function parsePaths(paths: string[]): string[] {
  return paths.filter(file => file.endsWith('.json') || file.endsWith('.json"')).map(file => normalizeFilePath(file.replace(/"/g, '')))
}

export function normalizeFilePath(filePath: string): string {
  let decodedPath = decodeURIComponent(escape(filePath))
  let normalizedPath = decodedPath

  return normalizedPath
}
