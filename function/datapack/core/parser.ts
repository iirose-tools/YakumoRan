import got from 'got'
import * as Ran from '../../../lib/api'
import Database from './db'
import vm from 'vm'
import logger from '../../../lib/logger'
import permission from '../../permission/permission'

const GlobalDB = new Database('global')

const ctx = {
  bot: Ran.method,
  public_db: GlobalDB,
  utils: {
    got: got,
    permission: permission
  }
}

export default class Parser {
  private code: string
  private enable: boolean
  private db: Database
  private events: {
    [index: string]: string[]
  }

  public title: string
  public url: string

  constructor (url: string) {
    this.url = url
    this.code = ''
    this.events = {}
    this.title = 'Unknown'
    this.enable = false
    // @ts-ignore
    this.db = null

    const run = (code: string, event: any) => {
      try {
        const context = {
          ...ctx,
          event: event,
          private_db: this.db,
          logger: logger(this.title)
        }

        vm.createContext(context)

        vm.runInContext(code, context, {
          timeout: 5e3
        })
      } catch (error) {
        logger('Datapack').warn(error)
      }
    }

    // 挂载群聊消息事件
    Ran.Event.on('PublicMessage', event => {
      if (!this.enable) return
      if (this.events['event.PublicMessage']) {
        this.events['event.PublicMessage'].forEach(code => run(code, event))
      }
    })

    // 挂载私聊消息事件
    Ran.Event.on('PrivateMessage', event => {
      if (!this.enable) return
      if (this.events['event.PrivateMessage']) {
        this.events['event.PrivateMessage'].forEach(code => run(code, event))
      }
    })

    // 挂载加入房间事件
    Ran.Event.on('JoinRoom', event => {
      if (!this.enable) return
      if (this.events['event.JoinRoom']) {
        this.events['event.JoinRoom'].forEach(code => run(code, event))
      }
    })

    // 挂载离开事件
    Ran.Event.on('LeaveRoom', event => {
      if (!this.enable) return
      if (this.events['event.LeaveRoom']) {
        this.events['event.LeaveRoom'].forEach(code => run(code, event))
      }
    })

    // 挂载切换房间事件
    Ran.Event.on('SwitchRoom', event => {
      if (!this.enable) return
      if (this.events['event.SwitchRoom']) {
        this.events['event.SwitchRoom'].forEach(code => run(code, event))
      }
    })
  }

  async download () {
    logger('Datapack').info('开始下载数据包...')
    this.code = await got.get(this.url).text()
    logger('Datapack').info('下载完成，开始解析')
    this.parser()
  }

  parser () {
    this.events = {}

    const splittedCode = this.code.split('\n')

    const flags = {
      index: 0,
      code: ''
    }

    for (flags.index = 0; flags.index < splittedCode.length; flags.index++) {
      flags.code = ''

      const code = splittedCode[flags.index]

      if (flags.index === 0) {
        const title = /\/\/\s+(.*)/
        const dpTitle = title.exec(code)
        if (!dpTitle) continue

        this.title = dpTitle[1]

        continue
      }

      const start = /\/\/\s+@start\.(\S+)\.(\S+)/
      const end = /\/\/\s+@end/

      if (start.test(code)) {
        const m = start.exec(code)
        if (!m) continue
        const type = m[1]
        const name = m[2]
        const key = `${type}.${name}`

        while (true) {
          flags.index++
          const code = splittedCode[flags.index]

          if (end.test(code)) {
            if (!this.events[key]) this.events[key] = []
            this.events[key].push(flags.code)

            break
          }

          flags.code += `\n${code}`
        }
      }
    }

    logger('Datapack').info(`解析完成，共 ${Object.keys(this.events).length} 个事件`)

    this.db = new Database(this.title)
  }

  setStatus (status: boolean) {
    this.enable = status
  }
}
