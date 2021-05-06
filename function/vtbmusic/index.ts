import config from '../../config'
import * as api from '../../lib/api'
import { vtbmusic } from './api'
import permission from '../permission/permission'

api.command(/^vtb点歌(.*)$/, (m, e, reply) => {
  vtbmusic.search(m[1].trim()).then(e => {
    if (e) {
      api.method.sendMedia('music', e.title, e.signer, e.cover, `https://vtbmusic.com/song?id=${e.id}`, e.music, e.duration, e.bitrate, config.app.color)
    } else {
      reply('[vtbmusic] 点歌失败', config.app.color)
    }
  })
})

api.command(/^vtb点歌$/, (m, e, reply) => {
  vtbmusic.hotMusic().then(e => {
    if (e) {
      api.method.sendMedia('music', e.title, e.signer, e.cover, `https://vtbmusic.com/song?id=${e.id}`, e.music, e.duration, e.bitrate, config.app.color)
    } else {
      reply('[vtbmusic] 点歌失败', config.app.color)
    }
  })
})

api.command(/^vcut$/, (m, e, reply) => {
  if (permission.users.hasPermission(e.uid, 'vtbmusic.cut')) {
    reply('cut', config.app.color)
  }
})
