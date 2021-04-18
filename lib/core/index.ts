import status from './status'
import decoder from '../decoder'
import login from '../encoder/system/login'
import { WebSocket, Bot } from '../event'
import logger from '../logger'
import init, { close, send } from '../websocket'
import config from '../../config'

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
  status('connected')
  const err = await send(login())
  if (err) {
    status('login_fail')
    logger('Core').error('登录包发送失败', err)
  } else {
    WebSocket.once('message', (msg) => {
      if (msg === '%*"2') {
        status('login_fail')
        logger('Core').fatal('登录失败，用户名或密码错误')
        process.exit(1)
      } else {
        status('login_success')
        logger('Core').info('收到服务器返回数据, 登录成功')
        Bot.emit('login')

        logger('Core').info(`启动完成 欢迎使用: ${config.account.username}`)
      }
    })
    logger('Core').info('登录包发送成功')
  }
})

init()
status('start')

setInterval(() => {
  status('heartbeat')
}, 3e4)

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
