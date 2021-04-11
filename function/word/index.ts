import fs from 'fs'
import path from 'path'
import * as api from '../../lib/api'
import config from '../../config'
import logger from '../../lib/logger'

try {
  fs.mkdirSync(path.join(__dirname, '../../data/word'))
} catch (error) {}

// 是否为管理员
const isAdmin = (name: string) => {
  const allowed = getAdmin()
  if (allowed.admin.includes(name)) {
    return true
  } else {
    return false
  }
}
const isOp = (name:string) => {
  const op = getAdmin()
  if (op.op.include(name)) {
    return true
  } else {
    return false
  }
}

// 获取词库列表
const getWord = () => {
  const wordPath = path.join(__dirname, '../../data/word/word.json')
  if (!fs.existsSync(wordPath)) {
    fs.writeFileSync(wordPath, '{}')
  }

  return JSON.parse(fs.readFileSync(wordPath).toString())
}

// 获取权限列表
const getAdmin = () => {
  const opPath = path.join(__dirname, '../../data/word/op.json')
  if (!fs.existsSync(opPath)) {
    fs.writeFileSync(opPath, '{"admin":[],"op":[]}')
  }

  return JSON.parse(fs.readFileSync(opPath).toString())
}
// 苏苏的随机数生成姬
const random = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n) }

// 更新json文件
const update = (file: any, tyf: string) => {
  try {
    fs.writeFileSync(path.join(__dirname, `../../data/word/${tyf}.json`), JSON.stringify(file, null, 3))
    logger('Word').info('词库文件写入成功')
  } catch (error) {
    logger('Word').warn('词库文件写入失败', error)
  }
}

// 过滤一些关键词
const fitter = (txt: string, ty: number) => {
  if (ty === 0) {
    txt = txt.replace(/[\s[\]]/g, '')
  }
  if (ty === 1) {
    txt = txt.replace(/[@[\] ]/g, '')
  }
  return txt
}

// 判断error
const isError = (element: any, index: any, array: any) => {
  return (element === null)
}

// 添加问答...
api.command(/^\.问(.*)答(.*)$/, async (m, e, reply) => {
  if (!isAdmin(e.uid) && e.uid !== config.app.master_uid && !isOp(e.uid)) return
  const word = getWord()
  let wd1: string = m[1]// 问后面的内容
  const wd2: string = m[2]// 答后面的内容
  wd1 = fitter(wd1, 0)
  if (word[wd1] == null) {
    word[wd1] = []
  }
  const i = word[wd1].push(wd2)// 新增对象（属性

  update(word, 'word')
  reply('添加成功,当前序列为' + i, config.app.color)
})

// 删除部分问答
api.command(/^\.删问(.*)序[号|列](.*)$/, async (m, e, reply) => {
  if (!isAdmin(e.uid) && e.uid !== config.app.master_uid && !isOp(e.uid)) return
  const word = getWord()
  let wd1: string = m[1]// 问后面的内容
  const wd2 = Number(m[2]) - 1
  wd1 = fitter(wd1, 0)
  word[wd1].splice(wd2, 1)
  const passed = word[wd1].every(isError)
  if (passed === true) {
    delete word[wd1]
  }

  update(word, 'word')
  reply('删除成功', config.app.color)
})

// 查看词库list
api.command(/^\.问表(.*)$/, async (m, e, reply) => {
  if (!isAdmin(e.uid) && e.uid !== config.app.master_uid && !isOp(e.uid)) return
  const word = getWord()
  let wd1: string = m[1]
  wd1 = fitter(wd1, 0)
  let ran: number = 0
  for (const list of word[wd1]) {
    ran++
    reply(ran + ':' + list, config.app.color)
  }
})

// 删除一整个回复
api.command(/^\.删全问(.*)$/, async (m, e, reply) => {
  if (!isAdmin(e.uid) && e.uid !== config.app.master_uid && !isOp(e.uid)) return
  let wd1: string = m[1]// 问后面的内容
  const word = getWord()
  wd1 = fitter(wd1, 0)

  delete word[wd1]

  update(word, 'word')
  reply('删除成功', config.app.color)
})

// 关键词回复
api.Event.on('PublicMessage', msg => {
  if (msg.username === config.account.username) return // 不响应自己发送的消息
  const word = getWord()
  let wd1: string = msg.message.trim()

  const reply = api.method.sendPublicMessage

  wd1 = fitter(wd1, 0)

  if (word[wd1] != null) {
    const ran: number = word[wd1].length
    const rd: number = random(0, ran - 1)
    reply(word[wd1][rd], config.app.color)
  }
})

// 饼修改的部分：
api.command(/^.添加权限(.*):(.*)$/, async (m, e, reply) => {
  // 只允许master和admin进行该操作。
  let added: string = m[1]
  added = fitter(added, 1)
  const allowed = getAdmin()

  if (m[2] === '高级') {
    if (e.uid !== config.app.master_uid) return
    allowed.admin.push(added)
    update(allowed, 'op')
    reply('高级权限添加成功', config.app.color)
  }
  if (m[2] === '普通') {
    if (e.uid !== config.app.master_uid && !isAdmin(e.uid)) return
    allowed.op.push(added)
    update(allowed, 'op')
    reply('权限添加成功', config.app.color)
  }


})

api.command(/^.移除权限(.*):(.*)$/, async (m, e, reply) => {
  // 只允许master和admin进行该操作。
  let username: string = m[1]
  username = fitter(username, 1)
  const allowed = getAdmin()

  if (m[2] === '高级') {
    if (e.uid !== config.app.master_uid) return
    allowed.admin.forEach(function (item: any, index: any, arr: any) {
      if (item === username) {
        allowed.admin.splice(index, 1)
      }
    })
    update(allowed, 'op')
    // 将username写到一个json里...然后我研究下怎么写json...哎。
    reply('权限移除成功', config.app.color)
  }
  if (m[2] === '普通') {
    if (e.uid !== config.app.master_uid && !isAdmin(e.uid)) return
    allowed.op.forEach(function (item: any, index: any, arr: any) {
      if (item === username) {
        allowed.op.splice(index, 1)
      }
    })
    update(allowed, 'op')
    // 将username写到一个json里...然后我研究下怎么写json...哎。
    reply('权限移除成功', config.app.color)
  }
  // 找到并删除。
})
