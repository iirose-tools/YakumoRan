import { Bot } from "./core/bot";
import { Config, TypeofConfig } from "./core/config/config";
import { PluginLoader } from './core/loader';
import { Plugin } from "./core/plugin";
import { Logger } from "./core/logger";
import { Decorators } from "./core/plugin/decorators";
import { isAsync } from "./core/utils/isAsync";

export class App {
  private config: Config;
  private pluginLoader: PluginLoader
  private logger: Logger = new Logger('App')
  public bot: Bot
  public decorators: Decorators = new Decorators()

  constructor (config?: TypeofConfig) {
    this.config = new Config(config);
    this.bot = new Bot(this.config)
    this.pluginLoader = new PluginLoader(this.bot, this.config)
  }

  public loadPlugin(name: string, plugin?: Plugin) {
    try {
      this.logger.info(`正在加载插件 ${name}`)
      this.pluginLoader.load(name, plugin)
      this.logger.info(`插件 ${name} 加载完成`)
    } catch (error) {
      this.logger.error(`插件 ${name} 加载失败: `, error)
    }
  }

  private async init () {
    this.bot.on("__ALL__", async (event, args) => {
      const middlewares = this.decorators.middlewares.get(event) || []
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

      const listeners = this.decorators.events.get(event) || []
      for (const listener of listeners) {
        if(isAsync(listener.handle)) {
          await listener.handle(args)
        } else {
          listener.handle(args)
        }
      }

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
}