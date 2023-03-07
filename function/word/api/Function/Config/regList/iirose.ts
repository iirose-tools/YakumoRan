export const regList: [RegExp, string, string][] = [
  [/\s*\[\*([\s\S]+)\*\]\s*/, '(@)', 'yname'], // 对方昵称
  [/\s*\[@([\s\S]+)@\]\s*/, '(id)', 'yid'], // 对方id
  [/\s*<([\s\S]+)>\s*/, '<语>', 'text'],
  [/\s*(\d+)\s*/, '(数)', 'number']
]
