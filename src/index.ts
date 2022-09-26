import { Bot } from "./core/bot";
import { Config, TypeofConfig } from "./core/config/config";
import { PluginLoader, globalPlugins } from './core/loader';
import { Plugin } from "./core/plugin";
import { Logger } from "./core/logger";
import { Decorators } from "./core/plugin/decorators";

export class App {
  private config: Config;
  private pluginLoader: PluginLoader
  private logger: Logger = new Logger('App')
  public bot: Bot
  public decorators: Decorators = new Decorators()

  constructor (config?: TypeofConfig) {
    this.config = new Config(config);
    this.bot = new Bot(this.config)
    this.pluginLoader = new PluginLoader(this.bot, this, this.config)
    this.InitHelpCommand()
  }

  public loadPlugin(name: string, plugin?: (app: App) => typeof Plugin) {
    try {
      this.logger.info(`正在加载插件 ${name}`)
      this.pluginLoader.load(name, plugin)
      this.logger.info(`插件 ${name} 加载完成`)
    } catch (error) {
      this.logger.error(`插件 ${name} 加载失败: `, error)
    }
  }

  private InitHelpCommand () {
    this.bot.on('PublicMessage', event => {
      const cmd = event.message.split(' ')[0]
      const args = event.message.split(' ').slice(1)
      const plugins = globalPlugins.get(this.config.getConfig().bot.username)
      if (!plugins) return

      const commandsByPlugin: {
        [index: string]: {
          name: string;
          desc: string;
          usage: string;
          command: RegExp;
          privateChat?: boolean
          publicChat?: boolean
        }[]
      } = {}

      const pluginByID: {
        [index: string]: Plugin
      } = {}

      plugins.forEach(plugin => {
        const id = plugin.plugin_id
        const name = plugin.constructor.name

        pluginByID[id] = plugin

        const commands = this.decorators.commands.filter(command => command._this.constructor.name === name)
        if (!commands) return
        if (!commandsByPlugin[id]) commandsByPlugin[id] = []

        commandsByPlugin[id].push(...commands.map(item => item.options))
      })

      if (cmd === '/help') {
        const isNumber = /^\d+$/.test(args[0])
        if (isNumber || args[0] === undefined) {
          // 分页获取
          const page = isNumber ? parseInt(args[0]) : 1

          const pluginNames = Object.keys(commandsByPlugin)
          const pluginCount = pluginNames.length
          const pluginPerPage = 3
          const maxPage = Math.ceil(pluginCount / pluginPerPage)

          if (page > maxPage) return this.bot.api.sendPublicMessage(`已经是最后一页了`)

          const start = (page - 1) * pluginPerPage
          const end = start + pluginPerPage
          const pluginList = pluginNames.slice(start, end)

          const message = []

          for (const id of pluginList) {
            const command = commandsByPlugin[id]
            const plugin = pluginByID[id]

            message.push(`插件: ${plugin.plugin_name}`)
            message.push(`作者: ${plugin.plugin_author}`)
            message.push(`版本: ${plugin.plugin_version}`)
            message.push('\n')
            message.push(plugin.plugin_description || '无描述')
            message.push('\n')
            message.push('命令列表:')
            message.push('\n')
            message.push(command.map(c => {
              return `${c.name} - ${c.desc}(${c.usage})`
            }).join('\n'))

            message.push('\n')
            message.push('===============')
            message.push('\n')
          }

          this.bot.api.sendPublicMessage(message.join('\n'))
        } else {
          // 指定id获取
          const id = args[0]
          const command = commandsByPlugin[id]
          const plugin = pluginByID[id]
          if (!plugin) return this.bot.api.sendPublicMessage(`插件 ${args[0]} 不存在`)

          const message = []

          message.push(`插件: ${plugin.plugin_name}`)
          message.push(`作者: ${plugin.plugin_author}`)
          message.push(`版本: ${plugin.plugin_version}`)
          message.push('\n')
          message.push(plugin.plugin_description || '无描述')
          message.push('\n')
          message.push('命令列表:')
          message.push('\n')
          message.push(command.map(c => {
            return `${c.name} - ${c.desc}(${c.usage})`
          }).join('\n'))

          this.bot.api.sendPublicMessage(message.join('\n'))
        }
      }
    })
  }
}