import got from 'got'
import sha1 from 'sha1'
import config from '../../config'
import * as Ran from '../../lib/api'
import logger from '../../lib/logger'
import fs from 'fs'
import path from 'path'

const room = config.account.room

const getSign = (msg: string, time: number) => sha1(`${room}-${msg}-${time}`)

Ran.Event.on('PublicMessage', msg => {
  if (!fs.existsSync(path.join(process.cwd(), './mentality.allow'))) return
  logger('mentality').info('Mentality已启动')
  const time = new Date().getTime()
  const message = msg.message
  const name = msg.username
  const uid = msg.uid
  const sign = getSign(message, time)

  got.get('http://bot.peer.ink/api/v1/iirose/callback', {
    searchParams: {
      room: room,
      name: name,
      uid: uid,
      msg: message,
      sign: sign,
      time: time
    }
  }).then(resp => {
    if (resp.statusCode !== 200) logger('mentality').warn('消息上报失败')
  })
})
