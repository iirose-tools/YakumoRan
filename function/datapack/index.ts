import fs from 'fs'
import path from 'path'
import * as Ran from '../../lib/api'
import Parser from './core/parser'

Ran.Event.once('login', () => {
  const filename = path.join(Ran.Data, 'datapack', 'datapack.list')
  if (!fs.existsSync(filename)) {
    const list = [
      'https://api.peer.ink/mock/iirose/datapack/demo.js'
    ]
    fs.writeFileSync(filename, JSON.stringify(list))
  }

  mgr.read()
})

const mgr: {
  list: Parser[]
  write (): void
  read (): void
  load (url: string): void
  unload (id: number): void
  setStatus (id: number, status: boolean): void
} = {
  list: [],
  write: () => {
    const filename = path.join(Ran.Data, 'datapack', 'datapack.list')
    fs.writeFileSync(filename, JSON.stringify(mgr.list.map(e => e.url)))
  },
  read: () => {
    const filename = path.join(Ran.Data, 'datapack', 'datapack.list')
    const list = [...JSON.parse(fs.readFileSync(filename).toString())]
    mgr.list = list.map(url => {
      const parser = new Parser(url)
      parser.download()
      parser.setStatus(true)
      return parser
    })
  },
  load: async (url) => {
    const parser = new Parser(url)
    parser.download()
    parser.setStatus(true)
    mgr.list.push(parser)
    mgr.write()
  },
  unload: async (id) => {
    if (mgr.list[id]) {
      mgr.list[id].setStatus(false)
      mgr.list = mgr.list.filter((v, i) => i !== id)
    }
  },
  setStatus: async (id, status) => {
    if (mgr.list[id]) {
      mgr.list[id].setStatus(status)
    }
  }
}

Ran.command(/^\.dp load (.*)$/, 'datapack.load', (m, e, reply) => {
  mgr.load(m[1])
})

Ran.command(/^\.dp list$/, 'datapack.list', (m, e, reply) => {
  if (mgr.list.length === 0) return reply('没有加载任何数据包')

  reply(mgr.list.map((v, i) => `${i}. ${v.title}`).join('\n'))
})

Ran.command(/^\.dp reload (\d+)$/, 'datapack.reload', async (m, e, reply) => {
  try {
    mgr.list[Number(m[1])].download()
    reply('重载成功')
  } catch (error) {
    reply('重载失败')
  }
})

Ran.command(/^\.dp start (\d+)$/, 'datapack.start', (m, e, reply) => {
  const index = Number(m[1])

  if (mgr.list[index]) mgr.setStatus(index, true)

  reply('启动成功')
})

Ran.command(/^\.dp stop (\d+)$/, 'datapack.stop', (m, e, reply) => {
  const index = Number(m[1])

  if (mgr.list[index]) mgr.setStatus(index, false)

  reply('关闭成功')
})
