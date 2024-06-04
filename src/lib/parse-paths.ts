export function parsePaths(paths: string[]): string[] {
  return paths
    .filter(file => file.endsWith('.json') || file.endsWith('.json"'))
    .map(file => normalizePath(file.replace(/"/g, '')))
}

export function normalizePath(input: string): string {
  let converted = input

  converted = converted.replace(/\\303\\241/g, 'á')
  converted = converted.replace(/\\303\\201/g, 'Á')
  converted = converted.replace(/\\303\\243/g, 'ã')
  converted = converted.replace(/\\303\\203/g, 'Ã')

  converted = converted.replace(/\\303\\251/g, 'é')
  converted = converted.replace(/\\303\\211/g, 'É')

  converted = converted.replace(/\\303\\255/g, 'í')
  converted = converted.replace(/\\303\\215/g, 'Í')

  converted = converted.replace(/\\303\\263/g, 'ó')
  converted = converted.replace(/\\303\\223/g, 'Ó')
  converted = converted.replace(/\\303\\263/g, 'Ó')
  converted = converted.replace(/\\303\\265/g, 'õ')

  converted = converted.replace(/\\303\\272/g, 'ú')
  converted = converted.replace(/\\303\\272/g, 'Ú')
  converted = converted.replace(/\\303\\241/g, 'ü')
  converted = converted.replace(/\\303\\241/g, 'Ü')

  converted = converted.replace(/\\303\\241/g, 'ñ')
  converted = converted.replace(/\\303\\241/g, 'Ñ')

  converted = converted.replace(/\\303\\247/g, 'ç')
  converted = converted.replace(/\\303\\207/g, 'Ç')

  converted = converted.replace(/\\"/g, '"').replace(/\\\\/g, '\\')

  return converted
}
