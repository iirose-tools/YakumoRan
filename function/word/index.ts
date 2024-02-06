import Word from './api/'
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

// 苏苏的随机数生成姬
const random = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n) }

/**
  * 获取词库json对象
  * @return 词库json对象
  */
const getword = () => {
  const fileName = path.join(api.Data, 'word/wordData')
  const list = fs.readdirSync(fileName)
  const data:any = {}
  list.forEach(function (item, index) {
    const word = JSON.parse(fs.readFileSync(fileName + `/${item}`).toString())
    for (let i = 0; i < Object.keys(word).length; i++) {
      if (!data[Object.keys(word)[i]]) {
        data[Object.keys(word)[i]] = []
      }
      data[Object.keys(word)[i]] = data[Object.keys(word)[i]].concat(word[Object.keys(word)[i]])
    }
  })
  return data
}

// 指定词库数据库根目录
const word = new Word(api.Data, config.app.master_uid, config.app.nickname)

// 输出公开/私聊的数组
const outputResolution = async (wd:string, userData:any) => {
  const publicValue:any = []
  const privateValue:any = []
  if (!wd) return null

  while (wd.match(/\$音频\s([\s\S]+?)\s(\d+?)\$/)) {
    const load = wd.match(/\$音频\s([\s\S]+?)\s(\d+?)\$/)
    if (load) {
      api.method.sendMedia('music', '词库点歌机', '[Word Core]', 'https://api.vvhan.com/api/acgimg', 'https://blog.reifuu.icu/', load[1], Number(load[2]), 320, '66ccff')
      wd = wd.replace(load[0], '')
    }
  }

  while (wd.match(/\$音频\s([\s\S]+?)\$/)) {
    const load = wd.match(/\$音频\s([\s\S]+?)\$/)
    if (load) {
      api.method.sendMedia('music', '词库点歌机', '[Word Core]', 'https://api.vvhan.com/api/acgimg', 'https://blog.reifuu.icu/', load[1], 240, 320, '66ccff')
      wd = wd.replace(load[0], '')
    }
  }

  while (wd.match(/\$视频\s([\s\S]+?)\s(\d+?)\$/)) {
    const load = wd.match(/\$视频\s([\s\S]+?)\s(\d+?)\$/)
    if (load) {
      api.method.sendMedia('video', '词库点歌机', '[Word Core]', 'https://api.vvhan.com/api/acgimg', 'https://blog.reifuu.icu/', '歌曲链接', Number(load[2]), 320, '66ccff')
      wd = wd.replace(load[0], '')
    }
  }

  while (wd.match(/\$视频\s([\s\S]+?)\$/)) {
    const load = wd.match(/\$视频\s([\s\S]+?)\$/)
    if (load) {
      api.method.sendMedia('video', '词库点歌机', '[Word Core]', 'https://api.vvhan.com/api/acgimg', 'https://blog.reifuu.icu/', '歌曲链接', 240, 320, '66ccff')
      wd = wd.replace(load[0], '')
    }
  }

  while (wd.match(/\$转账\s([\s\S]+?)\s(\d+?)\s([\s\S]+?)\$/)) {
    const load = wd.match(/\$转账\s([\s\S]+?)\s(\d+?)\s([\s\S]+?)\$/)
    if (load) {
      await api.method.utils.getUserProfile(userData.username).then(value => {
        const nowMoney = Number(value.money.hold)
        const toMoney = Number(load[2])

        if (nowMoney < toMoney) { wd = ' [词库核心] 机器人持有金额不足以转账' } else {
          api.method.payment(load[1], toMoney, load[3])
          wd = wd.replace(load[0], load[2])
        }
      })
    }
  }

  while (wd.match(/\$转账\s([\s\S]+?)\s(\d+?)\$/)) {
    const load = wd.match(/\$转账\s([\s\S]+?)\s(\d+?)\$/)
    if (load) {
      await api.method.utils.getUserProfile(userData.username).then(value => {
        const nowMoney = Number(value.money.hold)
        const toMoney = Number(load[2])

        if (nowMoney < toMoney) {
          wd = ' [词库核心] 机器人持有金额不足以转账'
        } else {
          api.method.payment(load[1], toMoney, `收到了${load[2]}钞钞`)
          wd = wd.replace(load[0], load[2])
        }
      })
    }
  }

  while (wd.match(/\$公告\s([\s\S]+?)\$/)) {
    const load = wd.match(/\$公告\s([\s\S]+?)\$/)
    if (load) {
      api.method.admin.notice(load[1])
      wd = wd.replace(load[0], '')
    }
  }

  while (wd.match(/\$赞\s([\s\S]+?)\$/)) {
    const load = wd.match(/\$赞\s([\s\S]+?)\$/)
    if (load) {
      api.method.like(load[1], ' [词库核心]触发获得了一个赞赞..!') // 给 uid 为 qwq 的用户点个赞，备注 xxx
      wd = wd.replace(load[0], '')
    }
  }

  while (wd.match(/\$赞\s([\s\S]+?)\s([\s\S]+?)\$/)) {
    const load = wd.match(/\$赞\s([\s\S]+?)\s([\s\S]+?)\$/)
    if (load) {
      api.method.like(load[1], load[2]) // 给 uid 为 qwq 的用户点个赞，备注 xxx
      wd = wd.replace(load[0], '')
    }
  }

  while (wd.match(/\[页(\d+?)\s([\s\S]+?)\]/)) {
    const load = wd.match(/\[页(\d+?)\s([\s\S]+?)\]/)
    if (load) {
      wd = wd.replace(load[0], '')
    }
  }

  while (wd.match(/\$丢([\s\S]+)\$/)) {
    const reg = wd.match(/\$丢([\s\S]+)\$/)
    if (reg) {
      api.method.admin.kick(reg[1])
      wd = wd.replace(reg[0], '')
    }
  }

  while (wd.match(/\$禁\s([\s\S]+?)\s([\s\S]+?)\s([\s\S]+?)\$/)) {
    const reg = wd.match(/\$禁\s([\s\S]+)\s([\s\S]+?)\s([\s\S]+?)\$/)
    if (reg) {
      api.method.admin.mute('all', reg[1], reg[2], reg[3])
      wd = wd.replace(reg[0], '')
    }
  }

  while (wd.match(/\$禁\s([\s\S]+?)\s([\s\S]+?)\$/)) {
    const reg = wd.match(/\$禁\s([\s\S]+)\s([\s\S]+?)\$/)
    if (reg) {
      api.method.admin.mute('all', reg[1], reg[2], ' [BOT-词库核心] 进行禁言 ')
      wd = wd.replace(reg[0], '')
    }
  }

  while (wd.match(/\$黑\s([\s\S]+?)\s([\s\S]+?)\s([\s\S]+?)\$/)) {
    const reg = wd.match(/\$黑\s([\s\S]+)\s([\s\S]+?)\s([\s\S]+?)\$/)
    if (reg) {
      api.method.admin.blackList(reg[1], reg[2], reg[3])
      wd = wd.replace(reg[0], '')
    }
  }

  while (wd.match(/\$黑\s([\s\S]+?)\s([\s\S]+?)\$/)) {
    const reg = wd.match(/\$黑\s([\s\S]+)\s([\s\S]+?)\$/)
    if (reg) {
      api.method.admin.blackList(reg[1], reg[2], '  [BOT-词库核心] 进行禁言  ')
      wd = wd.replace(reg[0], '')
    }
  }

  while (wd.match(/\$@([\s\S]+?)@\$/)) {
    if (wd.match(/\$@([\s\S]+?)@\$/)) {
      const text:any = wd.match(/\$@([\s\S]+?)@\$/)
      if (text) {
        publicValue.push(text[1])
        wd = wd.replace(text[0], '')
      }
    }
  }

  while (wd.match(/\$\/([\s\S]+?)\/\$/)) {
    if (wd.match(/\$\/([\s\S]+?)\/\$/)) {
      const text:any = wd.match(/\$\/([\s\S]+?)\/\$/)
      if (text) {
        privateValue.push(text[1])
        wd = wd.replace(text[0], '')
      }
    }
  }

  while (wd.match(/\$<([\s\S]+?)>\$/)) {
    const load = wd.match(/\$<([\s\S]+?)>\$/)
    if (load) {
      wd = wd.replace(load[0], '')
    }
  }

  return [publicValue, privateValue, wd]
}

// 主词库(公屏触发)
api.Event.on('PrivateMessage', msg => {
  if (per.users.hasPermission(msg.uid, 'kick.word')) return // 不响应已经被踢出的人
  if (msg.username === config.account.username) return // 不响应自己发送的消息
  const wd: string = msg.message.trim()
  const out:any = word.start(wd, msg)

  outputResolution(out, { username: config.account.username }).then((outputText) => {
    if (outputText) {
      if (outputText[2].length) { api.method.sendPrivateMessage(msg.uid, outputText[2]) }
      if (outputText[1].length) { api.method.sendPrivateMessage(msg.uid, outputText[1].join('')) }
      if (outputText[0].length) { api.method.sendPublicMessage(outputText[0].join('')) }
    }
  })
}
)

// 主词库(公屏触发)
api.Event.on('PublicMessage', msg => {
  if (per.users.hasPermission(msg.uid, 'kick.word')) return // 不响应已经被踢出的人
  if (msg.username === config.account.username) return // 不响应自己发送的消息
  const wd: string = msg.message.trim()
  const out:any = word.start(wd, msg)

  outputResolution(out, { username: config.account.username }).then((outputText) => {
    if (outputText) {
      if (outputText[2].length) { api.method.sendPublicMessage(outputText[2]) }
      if (outputText[1].length) { api.method.sendPrivateMessage(msg.uid, outputText[1].join('')) }
      if (outputText[0].length) { api.method.sendPublicMessage(outputText[0].join('')) }
    }
  })
}
)

// 添加问答√
api.command(/^\.问([\s\S]+?)答([\s\S]+)$/, 'word.add', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.add') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人
  reply(word.add(m[1], m[2], e))
}
)

// 删除问答√
api.command(/^\.删([\s\S]+?)序号([\s\S]+)$/, 'word.del', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.del') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人
  reply(word.del(m[1], m[2], e))
}
)

// 查看问（包含指定文字的问，需要显示是哪个库的√
api.command(/^\.问表([\s\S]+?)$/, 'word.qwhere', async (m, e, reply) => {
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人
  api.method.sendPrivateMessage(e.uid, word.getas(m[1]))
}
)

// 查看答 （包含指定文字的答，需要显示是哪个库的√
api.command(/^\.答表([\s\S]+?)$/, 'word.awhere', async (m, e, reply) => {
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人
  api.method.sendPrivateMessage(e.uid, word.getqs(m[1]))
}
)

// 设置为第几个词库
api.command(/^\.入库([\s\S]+?)$/, 'word.in', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, `word.in.${m[1]}`) && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人

  reply(word.in(m[1], e))
}
)

api.command(/^\.出库$/, 'word.out', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.out') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人
  reply(word.out(e))
}
)

api.command(/^\.表([\s\S]+)$/, 'word.list.a', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.find') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人
  api.method.sendPrivateMessage(e.uid, word.alist(m[1], e))
}
)

api.command(/^\.库表(.+)$/, 'word.list.find', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.find') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人
  api.method.sendPrivateMessage(e.uid, word.findList(m[1]))
}
)

api.command(/^\.库表$/, 'word.list', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.find') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人
  api.method.sendPrivateMessage(e.uid, word.list())
}
)

api.command(/^\.栈([\s\S]+)$/, 'word.list.q', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.find') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人
  api.method.sendPrivateMessage(e.uid, word.qlist(m[1]))
}
)

api.command(/^\.wop([\s\S]+)$/, 'word.admin.add', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.admin.add') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人
  reply(word.op(m[1]))
}
)

api.command(/^\.wdeop([\s\S]+)$/, 'word.admin.del', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.admin.del') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人
  reply(word.deop(m[1]))
}
)

api.command(/^\.([\s\S]+)天梯$/, 'word.list.data', async (m, e, reply) => {
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人
  reply(word.leaderboard(m[1]))
}
)

api.command(/^.上传([\s\S]+)$/, 'word.upload', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.upload') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人
  const up = word.getjson('wordData', m[1])
  if (JSON.stringify(up) !== '{}') {
    try {
      const response = await axios.post('https://word.reifuu.icu/new.php', up)
      reply(` [词库核心] ${response.data}`)
    } catch (error) {
      reply('投稿失败，请联系管理员手动进行投稿')
    }
  }
})

api.command(/^.下载([\s\S]+?):([\s\S]+)$/, 'word.download', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.download') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人
  try {
    const response = await axios.post('https://word.reifuu.icu/read.php', {
      id: m[1]
    })

    word.update('wordData', m[2], response.data)

    reply(' [词库核心] 下载成功')
  } catch (error) {
    console.log(error)
    reply('下载失败，请联系管理员手动进行投稿')
  }
})

api.command(/^\.删库([\s\S]+)$/, 'word.edit.over', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.over') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人
  reply(word.over(m[1]))
}
)

api.command(/^.增量([\s\S]+?):([\s\S]+)$/, 'word.download.add', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'word.edit.download') && !per.users.hasPermission(e.uid, 'permission.word')) return // 不响应没有权限的人，@后期改为能设置config文件内决定是否开启这一条
  if (per.users.hasPermission(e.uid, 'kick.word')) return // 不响应已经被踢出的人
  try {
    const response = await axios.post('https://word.reifuu.icu/read.php', {
      id: m[1]
    })

    word.incrementalUpdat('wordData', m[2], response.data)

    reply(' [词库核心] 下载成功')
  } catch (error) {
    console.log(error)
    reply('下载失败，请联系管理员手动进行投稿')
  }
})

api.command(/^\.阅读([\s\S]+)$/, 'word.reader.set', async (m, e, reply) => {
  const wordObj = getword()
  if (wordObj[m[1]]) {
    const nowRead = word.getjson('wordconfig', 'reader')
    if (!nowRead[e.uid]) {
      nowRead[e.uid] = {
        name: m[1],
        page: -1,
        arr: []
      } // 初始化阅读条目
    }

    if (nowRead[e.uid].name === m[1]) {
      nowRead[e.uid].arr = []
    }

    const originText = wordObj[m[1]]
    let text = originText[random(0, originText.length - 1)]

    while (text.match(/\[页(\d+?)\s([\s\S]+?)\]/)) {
      const load = text.match(/\[页(\d+?)\s([\s\S]+?)\]/)
      if (load) {
        nowRead[e.uid].arr[Number(load[1]) - 1] = load[2]

        text = text.replace(load[0], '')
      }
    }
    word.update('wordconfig', 'reader', nowRead)

    reply(' [词库核心] 已加载目标，请发送.上一页或.下一页开始阅读')
  } else {
    reply(' [词库核心] 欸...词库中没有找到你要阅读的条目哦')
  }
})

api.command(/^\.上一页$/, 'word.reader.up', async (m, e, reply) => {
  const nowRead = word.getjson('wordconfig', 'reader')
  if (!nowRead[e.uid]) { return reply(' [词库核心] 你还没有指定阅读条目..!') }
  if (nowRead[e.uid].page < 0) { nowRead[e.uid].page = nowRead[e.uid].arr.length }

  nowRead[e.uid].page--
  const page = Number(nowRead[e.uid].page)

  word.update('wordconfig', 'reader', nowRead)

  const out:any = word.toPars(nowRead[e.uid].arr[page], e.uid, e.username)

  outputResolution(out, { username: config.account.username }).then((outputText) => {
    if (outputText) {
      if (outputText[2].length) { reply(outputText[2]) }
      if (outputText[1].length) { api.method.sendPrivateMessage(e.uid, outputText[1].join('')) }
      if (outputText[0].length) { api.method.sendPublicMessage(outputText[0].join('')) }
    }
  })
})

api.command(/^\.下一页$/, 'word.reader.down', async (m, e, reply) => {
  const nowRead = word.getjson('wordconfig', 'reader')
  if (!nowRead[e.uid]) { return reply(' [词库核心] 你还没有指定阅读条目..!') }
  if (nowRead[e.uid].page >= nowRead[e.uid].arr.length - 1) { nowRead[e.uid].page = -1 }

  nowRead[e.uid].page++
  const page = Number(nowRead[e.uid].page)

  word.update('wordconfig', 'reader', nowRead)

  const out:any = word.toPars(nowRead[e.uid].arr[page], e.uid, e.username)

  outputResolution(out, { username: config.account.username }).then((outputText) => {
    if (outputText) {
      if (outputText[2].length) { reply(outputText[2]) }
      if (outputText[1].length) { api.method.sendPrivateMessage(e.uid, outputText[1].join('')) }
      if (outputText[0].length) { api.method.sendPublicMessage(outputText[0].join('')) }
    }
  })
})

api.command(/^\.重置页数$/, 'word.reader.clear', async (m, e, reply) => {
  const nowRead = word.getjson('wordconfig', 'reader')
  if (!nowRead[e.uid]) { return reply(' [词库核心] 你还没有指定阅读条目..!') }
  nowRead[e.uid].page = -1
  word.update('wordconfig', 'reader', nowRead)

  reply(' [词库核心] 重置页数成功')
})

// 设置为第几个词库
api.command(/^\.清零$/, 'word.kill', async (m, e, reply) => {
  try {
    fs.unlinkSync(path.join(api.Data, 'word/userData', `${e.uid}.json`))
    reply(' [词库核心] 删除成功')
  } catch (err) {
    reply(' [词库核心] 删除出现异常')
  }
}
)
// 已完成
// 入库需要word.in.库名才可入库
// 查库可以放相关库名.库表x
// 新增技能和道具槽
// 修复了一个bug
// 禁解析符号$[语句]$
// 私聊标签$/语句/$
// 公聊标签$@语句@$
// 隐藏标签$<语句>$
// 增量指令(下载词库的增量)
// 页码指定$页x 内容$
// 房间公告：$公告 内容$
// 转账：$转账 id 多少钞钞 备注$
//       $转账 id 多少钞钞$
// 视频：$视频 链接$
// 音频：$音频 链接$
