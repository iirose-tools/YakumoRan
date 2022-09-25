import { Bot } from "../bot";
import { Logger } from "../logger";

export class Plugin {
  public app: Bot;
  public plugin_name: string = '';
  public plugin_author: string = '';
  public plugin_description: string = '';
  public plugin_version: string = '';
  public config: any = {};
  public logger: Logger = new Logger(this.constructor.name);

  constructor(app: Bot) {
    this.app = app;
  }

  /**
   * @description 插件初始化
   */
  public async init() {}
}