<<<<<<< HEAD
import * as word from './api/index'
import config from '../../config'
=======
import Word from './api/main'
>>>>>>> parent of 4743efd (	deleted:    function/JustForFun/index.ts)
import * as api from '../../lib/api'
import config from '../../config'
import per from '../permission/permission'
import fs from 'fs'
import path from 'path'
import axios from 'axios'

try {
  fs.mkdirSync(path.join(api.Data, 'word/wordData'))
} catch (err) {}

try {
  fs.mkdirSync(path.join(api.Data, 'word/userData'))
} catch (err) {}

try {
  fs.mkdirSync(path.join(api.Data, 'word/wordconfig'))
} catch (err) {}

// 指定词库数据库根目录
const word = new Word(api.Data, config.app.master_uid, config.app.nickname)

// 主词库(公屏触发)
api.Event.on('PrivateMessage', msg => {
  if (per.users.hasPermission(msg.uid, 'word.kick')) return // 不响应已经被踢出的人
  if (msg.username === config.account.username) return // 不响应自己发送的消息
  const wd: string = msg.message.trim()
  const reply = api.method.sendPrivateMessage // 定义发送文本的函数
  const out = word.start(wd, msg)
  if (out) {
    reply(msg.uid, out)
  }
}
)

// 主词库(公屏触发)
api.Event.on('PublicMessage', msg => {
  if (per.users.hasPermission(msg.uid, 'word.kick')) return // 不响应已经被踢出的人
  if (msg.username === config.account.username) return // 不响应自己发送的消息
  const wd: string = msg.message.trim()
  const reply = api.method.sendPublicMessage // 定义发送文本的函数
  const out = word.start(wd, msg)
  if (out) {
    reply(out)
  }
}
)

// 添加问答√
api.command(/^\.问(.*?)答(.*)$/, 'word.add', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.add') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人
  reply(word.add(m[1], m[2], e))
}
)

// 删除问答√
api.command(/^\.删(.*?)序号(.*)$/, 'word.del', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.del') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人
  reply(word.del(m[1], m[2], e))
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

  reply(word.in(m[1], e))
}
)

api.command(/^\.出库$/, 'word.out', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.out') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人
  reply(word.out(e))
}
)

api.command(/^\.表(.*)$/, 'word.list.a', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.find') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人
  api.method.sendPrivateMessage(e.uid, word.alist(m[1], e))
}
)

api.command(/^\.库表$/, 'word.list', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.find') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人
  api.method.sendPrivateMessage(e.uid, word.list())
}
)

api.command(/^\.栈(.*)$/, 'word.list.q', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.find') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人
  api.method.sendPrivateMessage(e.uid, word.qlist(m[1]))
}
)

api.command(/^\.wop(.*)$/, 'word.admin.add', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.admin.add') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人
  reply(word.op(m[1]))
}
)

api.command(/^\.wdeop(.*)$/, 'word.admin.del', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.admin.del') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人
  reply(word.deop(m[1]))
}
)

api.command(/^\.(.*)天梯$/, 'word.list.data', async (m, e, reply) => {
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人
  reply(word.leaderboard(m[1]))
}
)

api.command(/^.上传(.*)$/, 'word.upload', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.upload') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人
  const up = word.getjson('wordData', m[1])
  if (JSON.stringify(up) !== '{}') {
    try {
      const response = await axios.post('https://word.bstluo.top/new.php', up)
      reply(` [词库核心] ${response.data}`)
    } catch (error) {
      reply('投稿失败，请联系管理员手动进行投稿')
    }
  }
})

api.command(/^.下载(.*):(.*)$/, 'word.download', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.download') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'word.kick')) return // 不响应已经被踢出的人
  try {
    const response = await axios.post('https://word.bstluo.top/read.php', {
      id: m[1]
    })
    word.update('wordData', m[2], response.data)
    reply(' [词库核心] 下载成功')
  } catch (error) {
    console.log(error)
    reply('下载失败，请联系管理员手动进行投稿')
  }
})
/**
 * 导出，导入词库功能
 * 以node POST给服务器然后导出为直链
 * 导入为下载直链
 * 每隔一天清空一次缓存
 *
 * 删除一句、全部删除
*/
