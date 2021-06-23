import whoiser from 'whoiser'
import * as Ran from '../../lib/api'
import config from '../../config'
import { create } from '../pastebin'
import { plugin } from '../manager'

const flag = {
  status: true
}

plugin.on('whois', status => {
  flag.status = status
})

const parserObj = (obj: any) => {
  const result: string[] = []
  const keys = Object.keys(obj)
  for (const key of keys) {
    if (typeof obj[key] === 'object') {
      result.push(`${key} ->`)
      const r = parserObj(obj[key])
      for (const item of r) {
        result.push(`\t${item}`)
      }
    } else {
      result.push(`${key}: ${obj[key]}`)
    }
  }

  return result
}

Ran.command(/^\.whois (.*)$/, 'whois.do', async (m, e, reply) => {
  if (!flag.status) return reply('[Whois] 功能未启用')
  const result = await whoiser(m[1])
  const msg = parserObj(result)
  const url = await create(msg.join('\n'), 'YakumoRan', 'text')
  if (!url) return reply('结果上传失败', config.app.color)
  reply(url, config.app.color)
})
