import fs from 'fs'
import pack from './package.json'

const configPath = './config.json'

const defaultConfig = {
  version: pack.version,
  app: {
    nickname: '机器人昵称',
    master: '主人用户名',
    master_uid: '主人uid',
    color: '消息颜色'
  },
  function: {
    chat: {
      disable: true
    },
    scp079: {
      nsfw_rate: 0.8,
      allowGambling: true,
      rate_limit: {
        duration: 60,
        limit: 45,
        action: {
          type: 'warn',
          warn: {
            message: '请不要刷屏哦~'
          },
          mute: {
            duration: 60
          }
        }
      }
    },
    probab: {
      every: 2000,
      huifu: 20000
    }
  },
  account: {
    username: '机器人用户名',
    password: '机器人密码md5',
    room: '房间id'
  },
  logger: {
    level: 'INFO'
  }
}

if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, undefined, 4))
  console.log('默认配置创建完成，请修改 config.json 后重新启动程序')
  process.exit(0)
} else {
  const conf = JSON.parse(fs.readFileSync('./config.json').toString())
  if (!conf.version || conf.version !== pack.version) {
    const newConf = Object.assign(defaultConfig, conf)
    newConf.version = pack.version
    fs.writeFileSync(configPath, JSON.stringify(newConf, undefined, 4))
    console.log('配置文件版本不匹配，已更新完成，请参考 README.md 手动修改后重新启动程序')
    process.exit(0)
  }
}

export default JSON.parse(fs.readFileSync('./config.json').toString())
