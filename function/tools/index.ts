import * as api from '../../lib/api'

api.command(/^赞我$/, (m, e, reply) => {
  api.method.like(e.uid, 'qwq')
})

api.command(/^飞到(.*)$/, (m, e, reply) => {
  const m1 = m[1].replace(/[\s[\]_]/g, '')
  api.method.bot.moveTo(m1)
})
