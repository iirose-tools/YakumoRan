import * as word from './api/index'
import config from '../../config'
import * as api from '../../lib/api'

if (!word.permissions.have('word.*', config.app.master_uid)) { word.permissions.add('word.*', config.app.master_uid) }

// 主词库(私聊触发)
api.Event.on('PrivateMessage', msg => {
  if (msg.username === config.account.username) return // 不响应自己发送的消息
  const message: string = msg.message.trim()
  const name:string = msg.username
  const id:string = msg.uid

  const out = word.driver.mainStart(message, {
    mname: name,
    mid: id
  })

  if (!out) return
  api.method.sendPrivateMessage(id, out)
})

// 主词库(公屏触发)
api.Event.on('PublicMessage', msg => {
  if (msg.username === config.account.username) return // 不响应自己发送的消息
  const message: string = msg.message.trim()
  const name:string = msg.username
  const id:string = msg.uid

  const out = word.driver.mainStart(message, {
    mname: name,
    mid: id
  })

  if (!out) return
  api.method.sendPublicMessage(out)
})

// 添加问答
api.command(/^\.问([\s\S]+?)答([\s\S]+)$/, 'word.editor.add', async (m, e, reply) => {
  if (!word.permissions.have('word.edit.add', e.uid)) return reply(' [词库核心] word.edit.add 权限不足')
  // 发送消息
  reply(word.editor.add(m[1], m[2], e.uid))
})

// 删除问答
api.command(/^\.删([\s\S]+?)序号([\s\S]+?)$/, 'word.editor.del', async (m, e, reply) => {
  if (!word.permissions.have('word.edit.del', e.uid)) return reply(' [词库核心] word.edit.del 权限不足')

  // 发送消息
  reply(word.editor.del(m[1], m[2], e.uid))
})

// 寻找触发词
api.command(/^\.问表([\s\S]+?)$/, 'word.editor.findQuestion', async (m, e, reply) => {
  // 回复结果
  reply(word.editor.findQuestion(m[1]))
})

// 入库
api.command(/^\.入库([\s\S]+?)$/, 'word.editor.changePointer', async (m, e, reply) => {
  // 回复结果
  const adminlist = word.editor.isWriter(e.uid)
  if (adminlist) {
    reply(word.editor.changePointer(m[1], e.uid))
  } else {
    reply(' [词库核心] 您可能不是此词库的作者，无法入库')
  }
})

// 出库
api.command(/^\.问表([\s\S]+?)$/, 'word.editor.resetPointer', async (m, e, reply) => {
  // 回复结果
  reply(word.editor.resetPointer(e.uid))
})

// 查看某关键词的回答
api.command(/^\.表([\s\S]+?)$/, 'word.editor.list', async (m, e, reply) => {
  // 回复结果
  reply(word.editor.list(m[1], e.uid))
})

// 查看拥有的词库
api.command(/^\.库表([\s\S]+?)$/, 'word.editor.findList', async (m, e, reply) => {
  // 回复结果
  reply(word.editor.findList(m[1]))
})

// 查看某词库拥有的所有触发词
api.command(/^\.栈([\s\S]+?)$/, 'word.editor.passiveList', async (m, e, reply) => {
  // 回复结果
  reply(word.editor.passiveList(m[1]))
})

// 给一位用户权限
// .赋权<uid> <权限名>
api.command(/^\.赋权\s+\[@([\s\S]+?)@\]\s+([\s\S]+?)$/, 'word.permissions.add', async (m, e, reply) => {
  // 回复结果
  if (!word.permissions.have('word.permissions.add', e.uid)) return reply(' [词库核心] word.permissions.add 权限不足')

  reply(word.permissions.add(m[2], m[1].toLowerCase()))
})

// 给一位用户权限
// .除权<uid> <权限名>
api.command(/^\.除权\s+\[@([\s\S]+?)@\]\s+([\s\S]+?)$/, 'word.permissions.del', async (m, e, reply) => {
  // 回复结果
  if (!word.permissions.have('word.permissions.del', e.uid)) return reply(' [词库核心] word.permissions.del 权限不足')

  reply(word.permissions.del(m[2], m[1].toLowerCase()))
})

// 查看某物品的数量
// .<物品名称>:<库名>天梯
api.command(/^\.([\s\S]+?):([\s\S]+?)天梯$/, 'word.driver.itemList', async (m, e, reply) => {
  const a = '\\\\\\*\n' + word.driver.itemList(m[1], m[2], { header: ' [@', body: '@] ' }, true)
  reply(a)
})

// 将一个库移动到回收站
// .删库<库名>
api.command(/^\.删库([\s\S]+?)$/, 'word.editor.killList', async (m, e, reply) => {
  if (!word.permissions.have('word.editor.killList', e.uid)) return reply(' [词库核心] word.editor.killList 权限不足')

  reply(word.editor.killList(m[1]))
})

// 将回收站清空
// .清空回收站
api.command(/^\.清空回收站$/, 'word.editor.clearBackup', async (m, e, reply) => {
  if (!word.permissions.have('word.editor.clearBackup', e.uid)) return reply(' [词库核心] word.editor.clearBackup 权限不足')

  reply(word.editor.clearBackup())
})

// 将回收站内某词库还原
// .还原回收站<词库名>
api.command(/^\.还原回收站([\s\S]+?)$/, 'word.editor.recoveryList', async (m, e, reply) => {
  if (!word.permissions.have('word.editor.recoveryList', e.uid)) return reply(' [词库核心] word.editor.recoveryList 权限不足')

  reply(word.editor.recoveryList(m[1]))
})

// 查看回收站内的词库
// .查看回收
api.command(/^\.查看回收$/, 'word.editor.backupList', async (m, e, reply) => {
  if (!word.permissions.have('word.editor.backupList', e.uid)) return reply(' [词库核心] word.editor.backupList 权限不足')

  reply(word.editor.backupList())
})

// 不放入回收站直接删除词库
// .强删<词库名>
api.command(/^\.强删([\s\S]+?)$/, 'word.editor.mandatoryDelete', async (m, e, reply) => {
  if (!word.permissions.have('word.editor.mandatoryDelete', e.uid)) return reply(' [词库核心] word.editor.mandatoryDelete 权限不足')

  reply(word.editor.mandatoryDelete(m[1]))
})

// 在当前词库添加此id为开发者
// .添加开发者<对方id>
api.command(/^\.添加开发者\s\[@([\s\S]+?)@\]\s$/, 'word.editor.addWriter', async (m, e, reply) => {
  if (!word.permissions.have('word.editor.addWriter', e.uid)) return reply(' [词库核心] word.editor.addWriter 权限不足')

  reply(word.editor.addWriter(m[1], e.uid))
})

// 在当前词库删除此id的开发者身份
// .删除开发者<对方id>
api.command(/^\.删除开发者\s\[@([\s\S]+?)@\]\s$/, 'word.editor.rmWriter', async (m, e, reply) => {
  if (!word.permissions.have('word.editor.rmWriter', e.uid)) return reply(' [词库核心] word.editor.rmWriter 权限不足')

  reply(word.editor.rmWriter(m[1], e.uid))
})

// 查看某词库的开发者
// .查看开发者<词库名>
api.command(/^\.查看开发者([\s\S]+?)$/, 'word.editor.viewWriter', async (m, e, reply) => {
  reply(word.editor.viewWriter(m[1]))
})

// 添加某物品到当前词库的物品清单
// .增包<物品名称>
api.command(/^\.增包([\s\S]+?)$/, 'word.editor.setPack', async (m, e, reply) => {
  if (word.editor.isWriter(e.uid)) {
    reply(word.editor.setPack(e.uid, m[1]))
  } else {
    reply(' [词库核心] 您不是当前词库的开发者，请检查当前所入的库')
  }
})

// 删除某物品从当前词库的物品清单
// .删包<物品名称>
api.command(/^\.删包([\s\S]+?)$/, 'word.editor.delPack', async (m, e, reply) => {
  if (word.editor.isWriter(e.uid)) {
    reply(word.editor.delPack(e.uid, m[1]))
  } else {
    reply(' [词库核心] 您不是当前词库的开发者，请检查当前所入的库')
  }
})

// 查看当前词库的物品清单
// .查包
api.command(/^\.查包$/, 'word.editor.listPack', async (m, e, reply) => {
  if (word.editor.isWriter(e.uid)) {
    reply(word.editor.listPack(e.uid))
  } else {
    reply(' [词库核心] 您不是当前词库的开发者，请检查当前所入的库')
  }
})

// 将当前词库的物品存储于背包某格
// .修改存储格<背包存储格>
api.command(/^\.修改存储格([\s\S]+?)$/, 'word.editor.changCache', async (m, e, reply) => {
  if (word.editor.isWriter(e.uid)) {
    reply(word.editor.changCache(m[1], e.uid))
  } else {
    reply(' [词库核心] 您不是当前词库的开发者，请检查当前所入的库')
  }
})

// 添加主动问答
// .有<主动式>时<回答句>
api.command(/^\.修改存储格([\s\S]+?)$/, 'word.editor.whenOn', async (m, e, reply) => {
  if (!word.permissions.have('word.editor.whenOn', e.uid)) return reply(' [词库核心] word.editor.whenOn 权限不足')
  // 发送消息
  reply(word.editor.whenOn(m[1], m[2], e.uid))
})

// 删除主动问答
// .无<触发词>序号<序号>
api.command(/^\.删([\s\S]+?)序号([\s\S]+?)$/, 'word.editor.whenOff', async (m, e, reply) => {
  if (!word.permissions.have('word.editor.whenOff', e.uid)) return reply(' [词库核心] word.editor.whenOff 权限不足')

  // 回复结果
  reply(word.editor.whenOff(m[1], m[2], e.uid))
})

// 上传
// 下载
