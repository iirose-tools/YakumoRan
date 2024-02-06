import * as Ran from '../../lib/api'
import { EventEmitter } from 'events'
import config from '../../config'

export const plugin = new EventEmitter()

Ran.command(/^启动(.*)$/, 'manager.enable', (m, e, reply) => {
  plugin.emit(m[1], true)

  reply('[Manager] 事件已触发', config.app.color)
})

Ran.command(/^关闭(.*)$/, 'manager.disable', (m, e, reply) => {
  plugin.emit(m[1], false)

  reply('[Manager] 事件已触发', config.app.color)
})
