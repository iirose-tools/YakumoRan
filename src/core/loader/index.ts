import { App } from "../..";
import { Bot } from "../bot";
import { Config } from "../config/config";
import { PrivateMessage } from "../packet/decoder/PrivateMessage";
import { PublicMessage } from "../packet/decoder/PublicMessage";
import { Plugin } from "../plugin";
import { isAsync } from "../utils/isAsync";

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
        if(isAsync(middleware.handle)) {
          [next, args] = await middleware.handle(args)
        } else {
          [next, args] = middleware.handle(args)
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
          const data = args as PublicMessage | PrivateMessage
          const message = data.message
          if (command.options.command.test(message)) {
            let next = true
            if (isAsync(command.handle)) {
              next = await command.handle(data, command.options.command.exec(message))
            } else {
              next = command.handle(data, command.options.command.exec(message))
            }

            if (next === false) return
          }
        }
      }

      // 事件监听器
      const listeners = this.app.decorators.events.get(event) || []
      for (const listener of listeners) {
        if(isAsync(listener.handle)) {
          await listener.handle(args)
        } else {
          listener.handle(args)
        }
      }

      // 中间件
      for (const middleware of middlewares) {
        if (!middleware.inBottom) continue
        if(isAsync(middleware.handle)) {
          args = await middleware.handle(args)
        } else {
          args = middleware.handle(args)
        }
      }
    })
  }

  public load(name: string, plugin?: (app: App) => typeof Plugin) {
    if (!plugin) plugin = require(name).default;
    if (!plugin) return
    const Plugin = plugin(this.app);
    const p = new Plugin(this.bot);

    this.plugins.push(p);

    Object.defineProperty(p, 'app', this.app)
    Object.defineProperty(p, 'config', this.config.getConfig().plugins[name] || {})

    p.init();
  }

  public getPlugins() {
    return this.plugins;
  }
}