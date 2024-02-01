import path from 'path'

export function parsePaths(paths: string[]): string[] {
  return paths
    .filter(file => file.endsWith('.json') || file.endsWith('.json"'))
    .map(file => normalizePath(file.replace(/"/g, '')))
}

export function normalizePath(input: string): string {
    let converted = input.replace(/\\303\\255/g, 'í');

    // Convert escaped double quotes and backslashes
    converted = converted.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  
    return converted;
}
