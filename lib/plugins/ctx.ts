import * as api from '../api'
import { PrivateMessage } from '../decoder/PrivateMessage'
import { PublicMessage } from '../decoder/PublicMessage'
import * as event from '../event'
import configData, { Config } from '../../config'
import typeVaildator, { registerType, replaceType } from './types'

const globalMessageEvents: Function[] = []

// 群聊事件
event.Bot.on('PublicMessage', (event) => {
  globalMessageEvents.forEach((f) => f(event))
})

// 私聊事件
event.Bot.on('PrivateMessage', (event) => {
  globalMessageEvents.forEach((f) => f(event))
})

class Command {
  private command: {
    prefix: string,
    name: string,
    description: string,
    usage: string,
    example: string,
    params: {
      name: string,
      type: string,
      optional: boolean
    }[]
  }

  constructor (command: string, prefix: string) {
    const p = command.split(' ')

    this.command = {
      prefix: prefix,
      name: p[0],
      description: '',
      usage: '',
      example: '',
      params: []
    }

    const state = {
      optional: false
    }

    for (const item of p.slice(1)) {
      // 获取开头和结尾的一个字符
      const start = item.charAt(0)
      const end = item.charAt(item.length - 1)
      const raw = item.substring(1, item.length - 1)

      const name = raw.split(':')[0]
      const type = raw.split(':')[1]

      if (start === ']') throw new Error(`${item} 参数格式错误`)
      if (start === '>') throw new Error(`${item} 参数格式错误`)
      if (start === '[' && end !== ']') throw new Error(`${item} 参数格式错误`)
      if (start === '<' && end !== '>') throw new Error(`${item} 参数格式错误`)

      const flag = start

      // 可选参数
      if (flag === '[') {
        state.optional = true

        this.command.params.push({
          name: name,
          type: type || 'any',
          optional: true
        })
      } else if (flag === '<') {
        if (state.optional) throw new Error('可选参数不能出现在必选参数前')

        this.command.params.push({
          name: name,
          type: type || 'any',
          optional: false
        })
      } else {
        throw Error('参数错误')
      }
    }

    return this
  }

  public description (description: string) {
    this.command.description = description
    return this
  }

  public usage (usage: string) {
    this.command.usage = usage
    return this
  }

  public example (example: string) {
    this.command.example = example
    return this
  }

  public prefix (prefix: string) {
    this.command.prefix = prefix
  }

  public action (callback: (_: any, reply: (message: string) => void) => void) {
    const bind = (event: PublicMessage | PrivateMessage) => {
      const splited = event.message.substring(1).split(' ')

      if (event.message.substring(0, 1) !== this.command.prefix) return
      if (splited[0] !== this.command.name) return

      const params = splited.slice(1)

      const parsedParams: {
        [index: string]: string
      } = {}

      for (const index in params) {
        const item = params[index]
        const config = this.command.params[index]

        // 判断是否为可选参数
        if (config && !config.optional) {
          if (!item || item.length === 0) {
            event.reply(`参数 <${config.name}> 不能为空`)
            return
          }
        }

        // 判断类型
        if (config && config.type) {
          if (!typeVaildator(item, config.type)) {
            event.reply(`参数 <${config.name}> 类型错误`)
            return
          }
        }

        // 格式化

        parsedParams[config.name] = item
      }
    }

    globalMessageEvents.push(bind)
  }
}

export default class Context {
  public config: Config
  public api: typeof api
  public event: typeof event

  constructor () {
    this.api = api
    this.event = event
    this.config = configData
  }

  public command (command: string) {
    return new Command(command, this.config.app.prefix)
  }

  registerType (type: string, vaildator: (value: any) => Promise<boolean>) {
    registerType(type, vaildator)
  }

  replaceType (type: string, vaildator: (value: any) => Promise<boolean>) {
    replaceType(type, vaildator)
  }
}
