import * as api from '../../lib/api'
import got from 'got'
import config from '../../config'
import util from 'util'

const chat = async (msg: string, uid: string): Promise<string> => {
  if (config.function.chat.api === 'Rin') {
    const resp = await got(encodeURI(`https://bot.fly3m.icu/api/chat?msg=${msg}`))
    return resp.body
  } else if (config.function.chat.api === 'Old') {
    const resp = await got(encodeURI(`https://api.peer.ink/api/v1/nlp/chat?msg=${msg}&uid=${uid}`))
    const data = JSON.parse(resp.body).result
    const reply = data.replace(/{{name}}/gm, config.app.nickname)

    return reply
  }

  return '配置文件错误'
}

if (!config.function.chat.disable) {
  api.Event.on('PrivateMessage', async msg => {
    if (config.function.chat.api !== 'Rin') return

    if (msg.message === '训练计划') {
      const url = (await got(`https://bot.fly3m.icu/getSession?username=IIROSE@${msg.username}`)).body

      msg.pm(`点击以下链接开始训练机器人，链接有效期4小时\n${url}`)
    }
  })

  api.Event.on('PublicMessage', async (msg) => {
    if (msg.username === config.account.username) return // 不响应自己发送的消息

    const reply = (message: string) => {
      const data = `${msg.message} (_hr) ${msg.username}_${Math.round(new Date().getTime() / 1e3)} (hr_) ${message}`
      api.method.sendPublicMessage(data, config.app.color)
    }

    if (msg.message.includes(config.app.nickname)) {
      try {
        const replyMsg = await chat(msg.message, msg.uid)
        if (replyMsg.length === 0) return
        reply(replyMsg)
      } catch (error) {
        reply([
          '出现了意料之外的错误',
          'ERROR:',
          util.inspect(error)
        ].join('\n'))
      }
    }
  })
}
