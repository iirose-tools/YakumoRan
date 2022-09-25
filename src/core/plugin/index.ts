import { Bot } from "../bot";
import { Logger } from "../logger";

export class Plugin {
  public app: Bot;
  public plugin_id: string = '';
  public plugin_name: string = '';
  public config: any = {};

  constructor(app: Bot) {
    this.app = app;
  }

  /**
   * @description 插件初始化
   */
  public async init() {}

  /**
   * @description 获取日志实例
   */
  public getLogger () {
    return new Logger(this.plugin_name);
  }

  public getApp () {
    return this.app;
  }
}