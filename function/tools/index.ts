import * as api from '../../lib/api'
import config from '../../config'

api.command(/^赞我$/, (m, e, reply) => {
  api.method.like(e.uid, 'qwq')
})

api.Event.on('PrivateMessage', msg => {
  if (msg.username === config.account.username) return // 不响应自己发送的消息
  if (msg.uid !== config.app.master_uid) return
  const wd1: string = msg.message.trim()
  let a:any = ''
  if (wd1.match(/ \[_(.*)_\] /)) {
    a = wd1.match(/ \[_(.*)_\] /)
  } else {
    a = ['', '']
  }
  api.method.bot.moveTo(a[1])
})
let a = 0

api.command(/^订阅$/, (m, e, reply) => {
  a = 1
  reply('订阅成功', '66ccff')
})

api.command(/^取消订阅$/, (m, e, reply) => {
  a = 0
  reply('取消订阅成功', '66ccff')
})

api.Event.on('PublicMessage', msg => {
  if (msg.username === config.account.username) return // 不响应自己发送的消息
  const wd1: string = msg.message.trim()
  const reply = api.method.sendPrivateMessage
  if (a === 1) {
    reply(config.app.master_uid, `${msg.username}:${wd1}`, '66ccff')
  }
})

api.Event.on('PrivateMessage', msg => {
  if (msg.username === config.account.username) return // 不响应自己发送的消息
  const wd1: string = msg.message.trim()
  const reply = api.method.sendPublicMessage
  if (a === 1) {
    reply(`${msg.username}:${wd1}`, '66ccff')
  }
})
