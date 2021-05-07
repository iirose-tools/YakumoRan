import * as Ran from '../../lib/api'
import config from '../../config'

Ran.command(/\/(\S+)/, 'fun.reply.signal', (m, e, reply) => {
  if (e.replyMessage) {
    const r = e.replyMessage.pop()
    if (r) {
      if (e.username === r.username) {
        reply(`${e.username} ${m[1]} 了 自己！`, config.app.color)
      } else {
        reply(`${e.username} ${m[1]} 了 ${r.username}！`, config.app.color)
      }
    }
  }
})

Ran.command(/\/(\S+) (\S+)/, 'fun.reply.multi', (m, e, reply) => {
  if (e.replyMessage) {
    const r = e.replyMessage.pop()
    if (r) {
      if (e.username === r.username) {
        reply(`${e.username} ${m[1]} 自己 ${m[2]}！`, config.app.color)
      } else {
        reply(`${e.username} ${m[1]} ${r.username} ${m[2]}！`, config.app.color)
      }
    }
  }
})
