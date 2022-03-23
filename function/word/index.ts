import Word from './api/main'
import * as api from '../../lib/api'
import config from '../../config'
import per from '../permission/permission'
import fs from 'fs'
import path from 'path'

try {
  fs.mkdirSync(path.join(api.Data, 'word/wordData'))
  fs.mkdirSync(path.join(api.Data, 'word/userData'))
  fs.mkdirSync(path.join(api.Data, 'word/wordlist'))
} catch (err) {}

// 指定词库数据库根目录
const word = new Word(api.Data)

// 主词库√
api.Event.on('PublicMessage', msg => {
  if (per.users.hasPermission(msg.uid, 'word.kick')) return // 不响应已经被踢出的人
  if (msg.username === config.account.username) return // 不响应自己发送的消息
  const wd: string = msg.message.trim()
  const reply = api.method.sendPublicMessage // 定义发送文本的函数
  const out = word.start(wd, msg.uid)
  if (out) {
    reply(out)
  }
}
)

// 添加问答√
api.command(/^\.问(.*?)答(.*)$/, 'word.add', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.add') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人
  reply(word.add(m[1], m[2], e.uid))
}
)

// 删除问答√
api.command(/^\.删问(.*?)序号(.*)库(.*)$/, 'word.del', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.del') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人
  reply(word.del(m[1], m[2], m[3]))
}
)

// 查看问（包含指定文字的问，需要显示是哪个库的√
api.command(/^\.问表(.*?)$/, 'word.qwhere', async (m, e, reply) => {
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人
  api.method.sendPrivateMessage(e.uid, word.getas(m[1]))
}
)

// 查看答 （包含指定文字的答，需要显示是哪个库的√
api.command(/^\.答表(.*?)$/, 'word.awhere', async (m, e, reply) => {
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人
  api.method.sendPrivateMessage(e.uid, word.getqs(m[1]))
}
)

// 设置为第几个词库
api.command(/^\.入库(.*?)$/, 'word.in', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.in') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人

  reply(word.in(m[1], e.uid))
}
)

api.command(/^\.出库$/, 'word.out', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.out') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人
  reply(word.out(e.uid))
}
)

/**
 * 导出，导入词库功能
 * 以node POST给服务器然后导出为直链
 * 导入为下载直链
 * 每隔一天清空一次缓存
 *
 * 删除一句、全部删除
*/
