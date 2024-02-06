import * as api from '../../lib/api'
import config from '../../config'
import per from '../permission/permission'
import fs from 'fs'
import path from 'path'

// 创建存储文件夹
try {
  fs.mkdirSync(path.join(api.Data, './tools'))
} catch (error) {}

// 正文↓
api.command(/^赞我$/, 'tools.like', (m, e, reply) => {
  api.method.like(e.uid, 'qwq')
})

api.command(/^带去(.*)$/, 'toole.goto', (m, e, reply) => {
  if (e.username === config.account.username) return // 不响应自己发送的消息
  try {
    if (!per.users.hasPermission(e.uid, 'tool.mov') && !per.users.hasPermission(e.uid, 'permission.tool.mov')) return
    let a:any = ''
    if (m[1].match(/ \[_(.*)_\] /)) {
      a = m[1].match(/ \[_(.*)_\] /)
    } else {
      a = ['', '']
    }
    api.method.bot.moveTo(a[1])
  } catch (error) {}
})

api.command(/^订阅$/, 'tools.feed.open', (m, e, reply) => {
  try {
    if (!per.users.hasPermission(e.uid, 'tool.op') && !per.users.hasPermission(e.uid, 'permission.tool.op')) return reply(` [Tools] :  [*${e.username}*] 您没有足够的权限去订阅`)
    per.users.addPermission(e.uid, 'tool.chat')
    reply(` [Tools] :  [*${e.username}*] 订阅成功了哦~`)
  } catch (error) {
    if (per.users.hasPermission(e.uid, 'tool.chat')) return reply(` [Tools] :  [*${e.username}*] 您已成功订阅，无需再次订阅`)
  }
})

api.command(/^取消订阅$/, 'tools.feed.calcel', (m, e, reply) => {
  try {
    if (!per.users.hasPermission(e.uid, 'tool.chat') && !per.users.hasPermission(e.uid, 'permission.tool.chat')) return reply(` [Tools] :  [*${e.username}*] 您没有订阅`)
    per.users.removePermission(e.uid, 'tool.chat')
    reply(` [Tools] :  [*${e.username}*] 取消订阅成功了哦~`)
  } catch (error) {
    if (!per.users.hasPermission(e.uid, 'tool.chat')) return reply(` [Tools] :  [*${e.username}*] 您未选择订阅...`)
  }
})

api.Event.on('PublicMessage', msg => {
  try {
    if (msg.username === config.account.username) return // 不响应自己发送的消息
    const list = per.users.has('tool.chat')
    list.forEach(function (e) {
      const a = e.toLowerCase()
      api.method.sendPrivateMessage(a, ` [*${msg.username}*]  :  ${msg.message.trim()}`)
    })
  } catch (error) {
  }
})

api.Event.on('PrivateMessage', msg => {
  try {
    if (msg.username === config.account.username) return // 不响应自己发送的消息
    const list = per.users.has('tool.chat')
    list.forEach(function (e) {
      const a = e.toLowerCase()
      if (a === msg.uid) {
        api.method.sendPublicMessage(` [*${msg.username}*]  :  ${msg.message.trim()}`)
      }
    })
  } catch (error) {
  }
})
