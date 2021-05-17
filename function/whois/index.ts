import whoiser from 'whoiser'
import * as Ran from '../../lib/api'
import config from '../../config'
import { create } from '../pastebin'
import per from '../permission/permission'

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
try {
  per.users.create('function')
} catch (error) {
}
if (!per.users.hasPermission('function', 'function.whois')) {
  Ran.command(/^\.ip (.*)$/, 'whois.ip', async (m, e, reply) => {
    const result = await whoiser.ip(m[1])
    const msg = parserObj(result)
    const url = await create(msg.join('\n'), 'YakumoRan', 'text')
    if (!url) return reply('结果上传失败', config.app.color)
    reply(url, config.app.color)
  })

  Ran.command(/^\/asn AS(.*)$/, 'whois.asn', async (m, e, reply) => {
    const result = await whoiser.asn(m[1])
    const msg = parserObj(result)
    const url = await create(msg.join('\n'), 'YakumoRan', 'text')
    if (!url) return reply('结果上传失败', config.app.color)
    reply(url, config.app.color)
  })

  Ran.command(/^\/domain (.*)$/, 'whois.domain', async (m, e, reply) => {
    const result = await whoiser.domain(m[1])
    const msg = parserObj(result)
    const url = await create(msg.join('\n'), 'YakumoRan', 'text')
    if (!url) return reply('结果上传失败', config.app.color)
    reply(url, config.app.color)
  })
}
