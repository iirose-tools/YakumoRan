import { App } from "../..";
import { Bot } from "../bot";
import { Config } from "../config/config";
import { PrivateMessage } from "../packet/decoder/PrivateMessage";
import { PublicMessage } from "../packet/decoder/PublicMessage";
import { Plugin } from "../plugin";
import { isAsync } from "../utils/isAsync";

export const globalPlugins = new Map<string, Map<string, Plugin>>();

export class PluginLoader {
  private readonly plugins: Plugin[] = []
  private config: Config
  private bot: Bot
  private app: App

  constructor (bot: Bot, app: App, config: Config) {
    this.bot = bot
    this.app = app
    this.config = config

    // 处理插件上的装饰器
    this.bot.on("__ALL__", async (event, args) => {
      // 中间件
      const middlewares = this.app.decorators.middlewares.get(event) || []
      for (const middleware of middlewares) {
        if (middleware.inBottom) continue
        let next = true

        const username = this.config.getConfig().bot.username
        const constructor = middleware._this.constructor.name
        const plguinInstance = globalPlugins.get(username)?.get(constructor) as Plugin

        if(isAsync(middleware.handle)) {
          [next, args] = await middleware.handle.bind(plguinInstance)(args)
        } else {
          [next, args] = middleware.handle.bind(plguinInstance)(args)
        }

        if (!next) return
      }

      if (event === 'PublicMessage' || event === 'PrivateMessage') {
        // 处理命令
        const commands = this.app.decorators.commands.filter(command => {
          if (event === 'PrivateMessage') return command.options.privateChat !== false
          if (event === 'PublicMessage') return command.options.publicChat !== false
          return true
        })

        for (const command of commands) {
          const username = this.config.getConfig().bot.username
          const constructor = command._this.constructor.name
          const plguinInstance = globalPlugins.get(username)?.get(constructor) as Plugin

          const data = args as PublicMessage | PrivateMessage
          const message = data.message
          if (command.options.command.test(message)) {
            let next = true
            if (isAsync(command.handle)) {
              next = await command.handle.bind(plguinInstance)(data, command.options.command.exec(message))
            } else {
              next = command.handle.bind(plguinInstance)(data, command.options.command.exec(message))
            }

            command.options.command.lastIndex = 0
            if (next === false) return
          }
        }
      }

      // 事件监听器
      const listeners = this.app.decorators.events.get(event) || []
      for (const listener of listeners) {
        const username = this.config.getConfig().bot.username
        const constructor = listener._this.constructor.name
        const plguinInstance = globalPlugins.get(username)?.get(constructor) as Plugin

        if(isAsync(listener.handle)) {
          await listener.handle.bind(plguinInstance)(args)
        } else {
          listener.handle.bind(plguinInstance)(args)
        }
      }

      // 中间件
      for (const middleware of middlewares) {
        const username = this.config.getConfig().bot.username
        const constructor = middleware._this.constructor.name
        const plguinInstance = globalPlugins.get(username)?.get(constructor) as Plugin

        if (!middleware.inBottom) continue
        if(isAsync(middleware.handle)) {
          args = await middleware.handle.bind(plguinInstance)(args)
        } else {
          args = middleware.handle.bind(plguinInstance)(args)
        }
      }
    })
  }

  public load(name: string, plugin?: (app: App) => any) {
    if (!plugin) plugin = require(name).default;
    if (!plugin) return
    const Plugin = plugin(this.app);
    const p = new Plugin(this.bot);

    this.plugins.push(p);

    p.app = this.bot
    p.config = this.config;

    p.init();

    const username = this.config.getConfig().bot.username
    const constructor = p.constructor.name

    if (!globalPlugins.has(username)) {
      globalPlugins.set(username, new Map())
    }
    
    const plugins = globalPlugins.get(username) as Map<string, Plugin>
    
    if (plugins.has(constructor)) {
      throw new Error(`插件 ${constructor} 已经存在`)
    }

    plugins.set(constructor, p)
  }

  public getPlugins() {
    return this.plugins;
  }
}