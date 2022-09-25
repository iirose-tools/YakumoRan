import { Bot } from "../bot";
import { Config } from "../config/config";
import { Plugin } from "../plugin";

export class PluginLoader {
  private readonly plugins: Plugin[] = []
  private config: Config
  private app: Bot

  constructor (app: Bot, config: Config) {
    this.app = app
    this.config = config
  }

  public load(name: string, plugin?: Plugin) {
    if (!plugin) plugin = new (require(name).default)(this.app);
    const p = plugin as Plugin
    this.plugins.push(p);

    Object.defineProperty(p, 'app', this.app)
    Object.defineProperty(p, 'config', this.config.getConfig().plugins[name] || {})

    p.init();
  }

  public getPlugins() {
    return this.plugins;
  }
}