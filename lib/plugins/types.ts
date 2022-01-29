const types: {
  [index: string]: (value: string) => Promise<boolean>
} = {
  any: () => Promise.resolve(true),
  string: async (value: string) => typeof value === 'string',
  number: async (value: string) => !isNaN(Number(value)),
  boolean: async (value: string) => ['true', 'false'].includes(value.toLowerCase())
}

export const registerType = (type: string, vaildator: (value: any) => Promise<boolean>) => {
  if (types[type]) return false

  types[type] = vaildator
  return true
}

export const replaceType = (type: string, vaildator: (value: any) => Promise<boolean>) => {
  if (types[type]) return false

  types[type] = vaildator
  return true
}

export default async (input: string, type: string) => {
  if (types[type]) {
    return await types[type](input)
  }

  return false
}
