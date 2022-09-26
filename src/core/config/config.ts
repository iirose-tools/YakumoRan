import * as path from 'path'
import * as fs from 'fs'
import { Logger } from '../logger'

export interface TypeofConfig {
  bot: {
    username: string
    password: string
    master_uid: string
    master_name: string
    color: string,
    room: string,
    room_password: string,
    port: number
  },
  database: {
    client: string,
    connection: any,
    useNullAsDefault: boolean
  },
  plugins: {
    [key: string]: any
  }
}

export class Config {
  private logger: Logger

  private defaultConfig: any = {
    "bot": {
      "username": "用户名",
      "password": "密码MD5",
      "master_uid": "主人UID",
      "master_name": "主人昵称",
      "color": "消息气泡颜色",
      "room": "房间id",
      "room_password": "房间密码（无密码请留空）",
    },
    "plugins": {}
  }

  private config: TypeofConfig

  constructor(conf?: TypeofConfig) {
    this.logger = new Logger('Config Loader')

    if (conf) {
      this.config = conf
      return
    }

    const cwd = process.cwd()
    const configPath = path.join(cwd, 'config.json')
    if (!fs.existsSync(configPath)) {
      this.logger.info('配置文件不存在，正在创建...')
      fs.writeFileSync(configPath, JSON.stringify(this.defaultConfig, null, 2))
      this.logger.info('配置文件创建完成，请手动修改配置文件后重新启动')
      process.exit(0)
    }

    this.logger.info('正在加载配置文件...')
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    this.logger.info('配置文件加载完成')

    this.config = config
  }

  public getConfig() {
    return this.config
  }

  public setConfig(config: TypeofConfig) {
    this.config = config
  }
}