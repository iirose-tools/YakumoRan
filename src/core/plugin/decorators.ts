import { Plugin } from '.'
import { IEmissions } from '../bot/index'

interface ExtendsPlugin extends Plugin {
  [key: string]: any
}

interface CommandOptions {
  name: string;
  desc: string;
  usage: string;
  command: RegExp;
  privateChat?: boolean
  publicChat?: boolean
}

interface Command {
  options: CommandOptions;
  handle: Function
  _this: ExtendsPlugin
}

interface Middleware {
  event: keyof IEmissions;
  handle: Function
  inBottom: boolean
  _this: ExtendsPlugin
}

interface EventListener {
  event: keyof IEmissions;
  handle: Function
  _this: ExtendsPlugin
  robot?: boolean
}

export class Decorators {
  commands: Command[] = []
  middlewares = new Map<string, Middleware[]>()
  events = new Map<string, EventListener[]>()

  /**
   * @description 注册命令(需要返回一个boolean值，表示是否继续执行后续命令和中间件)
   * @param command 命令选项
   */
  Command (command: CommandOptions) {
    return (target: ExtendsPlugin, propertyKey: keyof ExtendsPlugin, descriptor: PropertyDescriptor) => {
      this.commands.push({
        options: command,
        handle: descriptor.value,
        _this: target
      })
    }
  }

  /**
   * @description 注册中间件
   * @param event 事件名
   * @param inBottom 是否在最后执行
   */
  Middleware (event: keyof IEmissions, inBottom: boolean = false) {
    return (target: ExtendsPlugin, propertyKey: keyof ExtendsPlugin, descriptor: PropertyDescriptor) => {
      if (!this.middlewares.has(event)) this.middlewares.set(event, [])
      const list = this.middlewares.get(event) as Middleware[]

      list.push({
        event,
        handle: descriptor.value,
        inBottom,
        _this: target
      })

      this.middlewares.set(event, list)
    }
  }

  /**
   * @description 注册事件监听器
   * @param event 事件名
   */
  EventListener (event: keyof IEmissions, robot: boolean = false) {
    return (target: ExtendsPlugin, propertyKey: keyof ExtendsPlugin, descriptor: PropertyDescriptor) => {
      if (!this.events.has(event)) this.events.set(event, [])
      const list = this.events.get(event) as EventListener[]

      list.push({
        event,
        handle: descriptor.value,
        _this: target,
        robot
      })

      this.events.set(event, list)
    }
  }
}
