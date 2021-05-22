import decoder from '../decoder'
import login from '../encoder/system/login'
import { WebSocket, Bot } from '../event'
import logger from '../logger'
import init, { close, send } from '../websocket'
import config from '../../config'

const startAt = new Date().getTime()

WebSocket.on('message', (msg) => {
  if (!decoder(msg)) {
    logger('Decoder').warn('收到了无法解析的消息: ', (msg.length > 50) ? `${msg.substr(0, 50)}...` : msg)
  }
})

WebSocket.once('connect', () => {
  setInterval(() => {
    send('')
  }, 6e4)
})

WebSocket.on('connect', async () => {
  const err = await send(login())
  if (err) {
    logger('Core').error('登录包发送失败', err)
  } else {
    WebSocket.once('message', (msg) => {
      if (msg === '%*"2') {
        logger('Core').fatal('登录失败，密码错误')
        process.exit(1)
      } else if (msg === '%*"1') {
        logger('Core').fatal('登录失败，用户不存在')
        process.exit(1)
      } else if (msg === '%*"0') {
        // 鬼知道我为什么要处理一个只有游客才会触发的错误
        logger('Core').fatal('登录失败，此名字已被占用')
        process.exit(1)
      } else {
        logger('Core').info('收到服务器返回数据, 登录成功')
        Bot.emit('login')

        logger('Core').info('高性能ですから~')
        logger('Core').info(`启动完成 欢迎使用: ${config.account.username}`)
        logger('Core').info(`启动耗时: ${new Date().getTime() - startAt}ms`)
        logger('Core').debug('咱的聊天群：700080009')
      }
    })
    logger('Core').info('登录包发送成功')
  }
})

init()

export const moveTo = (roomId: string) => {
  logger('Core').info('正在切换房间...')
  try {
    config.account.room = roomId
    close()
    init()
    logger('Core').info('切换完成')
    return true
  } catch (error) {
    logger('Core').warn('切换失败', error)
    return false
  }
}
