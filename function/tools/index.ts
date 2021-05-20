import * as api from '../../lib/api'
import config from '../../config'
import per from '../permission/permission'
import fs from 'fs'
import path from 'path'

// 创建存储文件夹
try {
  fs.mkdirSync(path.join(api.Data, './tools'))
} catch (error) {}

// 获取json
const getjson = () => {
  const wordPath = path.join(api.Data, './tools/user.json')
  if (!fs.existsSync(wordPath)) {
    fs.writeFileSync(wordPath, '{"list":[]}')
  }

  return JSON.parse(fs.readFileSync(wordPath).toString())
}

// 更新json文件
const update = (file:any) => {
  try {
    fs.writeFileSync(path.join(api.Data, './tools/user.json'), JSON.stringify(file, null, 3))
  } catch (error) {
  }
}

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

api.command(/^订阅$/, 'tools.feed', (m, e, reply) => {
  try {
    const user = getjson()
    if (!per.users.hasPermission(e.uid, 'tool.op') && !per.users.hasPermission(e.uid, 'permission.tool.op')) return
    if (user.list.includes(e.uid)) return reply('已经订阅过咯~', '66ccff')
    user.list.push(e.uid)
    update(user)
    reply('订阅成功', '66ccff')
  } catch (error) {}
})

api.command(/^取消订阅$/, 'tools.feed.calcel', (m, e, reply) => {
  try {
    const user = getjson()
    if (!per.users.hasPermission(e.uid, 'tool.op') && !per.users.hasPermission(e.uid, 'permission.tool.op')) return
    if (!user.list.includes(e.uid)) return reply('还没有订阅过哦~', '66ccff')
    for (let i = 0; i < user.list.length; i++) {
      if (user.list[i] === e.uid) {
        user.list.splice(i - 1, 1)
      }
    }
    update(user)
    reply('取消订阅成功', '66ccff')
  } catch (error) {}
})

api.Event.on('PublicMessage', msg => {
  try {
    if (msg.username === config.account.username) return // 不响应自己发送的消息
    const wd1: string = msg.message.trim()
    const reply = api.method.sendPrivateMessage
    const user = getjson()
    for (let i = 0; i < user.list.length; i++) {
      if (user.listr[i]) {
        reply(user.list[i], `${msg.username}: ${wd1}`, '66ccff')
      }
    }
  } catch (error) {}
})

api.Event.on('PrivateMessage', msg => {
  try {
    if (msg.username === config.account.username) return // 不响应自己发送的消息
    if (!per.users.hasPermission(msg.uid, 'tool.op') && !per.users.hasPermission(msg.uid, 'permission.tool.op')) return
    const wd1: string = msg.message.trim()
    const reply = api.method.sendPublicMessage
    const user = getjson()
    if (user.list.includes(msg.uid)) {
      reply(`${msg.username}: ${wd1}`, '66ccff')
    }
  } catch (error) {}
})
