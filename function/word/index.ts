import fs from 'fs'
import path from 'path'
import * as api from '../../lib/api'
import config from '../../config'
import per from '../permission/permission'
import logger from '../../lib/logger'

try {
  fs.mkdirSync(path.join(api.Data, './word/user'))
  fs.mkdirSync(path.join(api.Data, './word/word'))
} catch (error) {}

// 判断error
const isError = (element: any, index: any, array: any) => {
  return (element === null)
}

// 检测延迟
const limit:any = JSON.parse('{}')
const getLimit = (uid: string, inp:string, tim: string) => {
  if (limit[uid + inp + tim]) return 1

  limit[uid + inp + tim] = true
  setTimeout(() => {
    delete limit[uid + inp + tim]
  }, Number(tim))
  return 0
}

// 苏苏的随机数生成姬
const random = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n) }

// 获取json
const getjson = (name:string, list:string) => {
  const wordPath = path.join(api.Data, `./word/${list}/${name}.json`)
  if (!fs.existsSync(wordPath)) {
    fs.writeFileSync(wordPath, '{}')
  }

  return JSON.parse(fs.readFileSync(wordPath).toString())
}

// 更新json文件
const update = (file:any, tyf:string, list:string) => {
  try {
    fs.writeFileSync(path.join(api.Data, `./word/${list}/${tyf}.json`), JSON.stringify(file, null, 3))
  } catch (error) {
  }
}

// 核心:判断
const toswitch = (te:string, st:string, t:string, word:any, id:string, aite:string, msg:any, matc:any, idList:any) => {
  let noew:any = {}
  switch (te) {
    case ('随机数字'): {
      noew = JSON.parse(st)
      word = word.replace(t, random(Number(noew['随机数字'][0]), Number(noew['随机数字'][1])))
      break
    }

    case ('判断'): {
      const st1:any = st.match(/\[(.*),(.*),(.*),(.*),(.*)\]/)
      st = `{"判断":["${st1[1]}","${st1[2]}","${st1[3]}","${st1[4]}","${st1[5]}"]}`
      noew = JSON.parse(st)
      let a:string = ''
      switch (noew['判断'][1]) {
        case ('>'): {
          if (!isNaN(Number(noew['判断'][0]))) {
            if (!isNaN(Number(noew['判断'][2]))) {
              if (Number(noew['判断'][0]) > Number(noew['判断'][2])) {
                a = noew['判断'][3]
              } else {
                a = noew['判断'][4]
              }
            }
          }
          break
        }
        case ('='): {
          if (noew['判断'][0] === noew['判断'][2]) {
            a = noew['判断'][3]
          } else {
            a = noew['判断'][4]
          }
          break
        }
        case ('<'): {
          if (!isNaN(Number(noew['判断'][0]))) {
            if (!isNaN(Number(noew['判断'][2]))) {
              if (Number(noew['判断'][0]) < Number(noew['判断'][2])) {
                a = noew['判断'][3]
              } else {
                a = noew['判断'][4]
              }
            }
          }
          break
        }
        case ('<>'): {
          if (!isNaN(Number(noew['判断'][0]))) {
            if (!isNaN(Number(noew['判断'][2]))) {
              if (Number(noew['判断'][0]) !== Number(noew['判断'][2])) {
                a = noew['判断'][3]
              } else {
                a = noew['判断'][4]
              }
            }
          }
          break
        }

        // 上方的判断为数字的判断
        // 下方的判断为字符的判断

        case ('=='): {
          if (noew['判断'][0]) {
            if (noew['判断'][2]) {
              if (noew['判断'][0] === noew['判断'][2]) {
                a = noew['判断'][3]
              } else {
                a = noew['判断'][4]
              }
            }
          }
          break
        }
        case ('<=>'): {
          if (noew['判断'][0]) {
            if (noew['判断'][2]) {
              if (noew['判断'][0] !== noew['判断'][2]) {
                a = noew['判断'][3]
              } else {
                a = noew['判断'][4]
              }
            }
          }
          break
        }
      }
      word = word.replace(t, a)
      break
    }

    case ('艾特'): {
      word = word.replace(t, ' [*' + aite + '*] ')
      break
    }

    case ('添加'): {
      const st1:any = st.match(/\[(.*),(.*),(.*),(.*),(.*)\]/)
      st = `{"添加":["${st1[1]}","${st1[2]}",${Number(st1[3])},${Number(st1[4])},"${st1[5]}"]}`
      noew = JSON.parse(st)
      let use:any
      if (st1[5] === '0' || st1[5] === '') {
        use = getjson(id, 'user')
      } else {
        use = getjson(st1[5], 'user')
      }
      if (use[noew['添加'][0]] == null) { use[noew['添加'][0]] = {} }
      if (use['属性'] == null) { use['属性'] = {} }
      if (use[noew['添加'][0]] == null) { use[noew['添加'][0]] = {} }
      if (use['属性'][noew['添加'][1]] == null) { use['属性'][noew['添加'][1]] = 0 }
      if (use[noew['添加'][0]][noew['添加'][1]] == null) { use[noew['添加'][0]][noew['添加'][1]] = 0 }
      use[noew['添加'][0]][noew['添加'][1]] = use[noew['添加'][0]][noew['添加'][1]] + noew['添加'][2]
      use['属性'][noew['添加'][1]] = use['属性'][noew['添加'][1]] + noew['添加'][2]

      if (st1[5] === '0' || st1[5] === '') {
        update(use, id, 'user')
      } else {
        update(use, st1[5], 'user')
      }

      const tty:number = noew['添加'][3]
      if (tty === 1) {
        word = word.replace(t, String(noew['添加'][0]))
      } else if (tty === 2) {
        word = word.replace(t, String(noew['添加'][1]))
      } else if (tty === 3) {
        word = word.replace(t, String(noew['添加'][2]))
      } else {
        word = word.replace(t, '')
      }
      break
    }

    case ('销毁'): {
      const st1:any = st.match(/\[(.*),(.*),(.*),(.*),(.*)\]/)
      st = `{"销毁":["${st1[1]}","${st1[2]}",${Number(st1[3])},${Number(st1[4])},"${st1[5]}"]}`
      noew = JSON.parse(st)
      let use:any
      if (st1[5] === '0' || st1[5] === '') {
        use = getjson(id, 'user')
      } else {
        use = getjson(st1[5], 'user')
      }

      if (JSON.stringify(use[noew['销毁'][0]]) === '{}') {
        delete use[noew['销毁'][0]]
      }
      use[noew['销毁'][0]][noew['销毁'][1]] = use[noew['销毁'][0]][noew['销毁'][1]] - noew['销毁'][2]
      use['属性'][noew['销毁'][1]] = use['属性'][noew['销毁'][1]] - noew['销毁'][2]
      let wd6:number = 1
      if (use[noew['销毁'][0]][noew['销毁'][1]] <= 0) {
        delete use[noew['销毁'][0]][noew['销毁'][1]]
        wd6 = 0
      }
      if (use['属性'][noew['销毁'][1]] <= 0) {
        delete use['属性'][noew['销毁'][1]]
        wd6 = 0
      }
      if (st1[5] === '0' || st1[5] === '') {
        update(use, id, 'user')
      } else {
        update(use, st1[5], 'user')
      }
      const tty:number = noew['销毁'][3]
      if (tty === 0) {
        word = word.replace(t, '销毁成功')
      }
      if (tty === 1) {
        if (wd6 === 1) {
          word = word.replace(t, String(noew['销毁'][0]))
        } else if (wd6 === 0) {
          word = word.replace(t, -1)
        }
      } else if (tty === 2) {
        if (wd6 === 1) {
          word = word.replace(t, String(noew['销毁'][1]))
        } else if (wd6 === 0) {
          word = word.replace(t, -1)
        }
      } else if (tty === 3) {
        if (wd6 === 1) {
          word = word.replace(t, String(noew['销毁'][2]))
        } else if (wd6 === 0) {
          word = word.replace(t, -1)
        }
      } else {
        word = word.replace(t, '')
      }
      break
    }

    case ('属性'): {
      const st1:any = st.match(/\[(.*),(.*),(.*)\]/)
      st = `{"属性":["${st1[1]}","${st1[2]}","${st1[3]}"]}`
      noew = JSON.parse(st)
      let use:any
      if (st1[3] === '0' || st1[3] === '') {
        use = getjson(id, 'user')
      } else {
        use = getjson(st1[5], 'user')
      }
      if (use[noew['属性'][0]] == null) { use[noew['属性'][0]] = {} }
      if (use['属性'] == null) { use['属性'] = {} }
      if (use[noew['属性'][0]] == null) { use[noew['属性'][0]] = {} }
      if (use['属性'][noew['属性'][1]] == null) { use['属性'][noew['属性'][1]] = 0 }
      if (use[noew['属性'][0]][noew['属性'][1]] == null) { use[noew['属性'][0]][noew['属性'][1]] = 0 }
      word = word.replace(t, use[noew['属性'][0]][noew['属性'][1]])
      break
    }

    case ('延迟'): {
      const st1:any = st.match(/\[(.*),(.*),(.*),(.*)\]/)
      st = `{"延迟":["${st1[1]}","${st1[2]}","${st1[3]}","${st1[4]}"]}`
      noew = JSON.parse(st)
      const yanchi:number = getLimit(id, noew['延迟'][0], noew['延迟'][1])
      if (yanchi === 0) {
        word = word.replace(t, noew['延迟'][2])
      }
      if (yanchi === 1) {
        word = word.replace(t, noew['延迟'][3])
      }
      break
    }

    case ('发送名'): {
      const st1:any = st.match(/\[(.*)\]/)
      st = `{"发送名":[${Number(st1[1])}]}`
      noew = JSON.parse(st)
      const tty:number = noew['发送名'][0]
      if (tty === 0) {
        word = word.replace(t, msg.username)
      }
      if (tty === 1) {
        word = word.replace(t, ` [*${msg.username}*] `)
      }
      break
    }

    case ('发送id'): {
      const st1:any = st.match(/\[(.*)\]/)
      st = `{"发送id":[${Number(st1[1])}]}`
      noew = JSON.parse(st)
      const tty:number = noew['发送id'][0]
      if (tty === 0) {
        word = word.replace(t, msg.uid)
      }
      if (tty === 1) {
        word = word.replace(t, ` [@${msg.uid}@] `)
      }
      break
    }

    case ('数字'): {
      const st1:any = st.match(/\[(.*)\]/)
      st = `{"数字":[${Number(st1[1])}]}`
      noew = JSON.parse(st)
      word = word.replace(t, matc[noew['数字'][0] - 1])
      break
    }

    case ('id'): {
      const st1:any = st.match(/\[(.*)\]/)
      st = `{"id":[${Number(st1[1])}]}`
      noew = JSON.parse(st)
      word = word.replace(t, idList[noew.id[0] - 1])
      break
    }

    case ('昵称'): {
      const st1:any = st.match(/\[(.*)\]/)
      st = `{"昵称":[${Number(st1[1])}]}`
      noew = JSON.parse(st)
      if (noew['昵称'][0] === 0) {
        word = word.replace(t, config.app.nickname)
      }
      break
    }

    case ('换行'): {
      const st1:any = st.match(/\[(.*)\]/)
      st = `{"换行":[${Number(st1[1])}]}`
      noew = JSON.parse(st)
      let a:string = ''
      for (let num = noew['换行'][0]; num > 0; num--) {
        a = a + '\n'
      }
      word = word.replace(t, a)
      break
    }

    case ('设定'): {
      const st1:any = st.match(/\[(.*),(.*),(.*),(.*),(.*)\]/)
      st = `{"设定":["${st1[1]}","${st1[2]}","${st1[3]}",${Number(st1[4])},"${st1[5]}"]}`
      noew = JSON.parse(st)
      let use:any

      if (st1[5] === '0' || st1[5] === '') {
        use = getjson(id, 'user')
      } else {
        use = getjson(st1[5], 'user')
      }
      if (use[noew['设定'][0]] == null) { use[noew['设定'][0]] = {} }
      use[noew['设定'][0]][noew['设定'][1]] = noew['设定'][2]
      if (st1[5] === '0' || st1[5] === '') {
        update(use, id, 'user')
      } else {
        update(use, st1[5], 'user')
      }

      const tty:number = noew['设定'][3]
      if (tty === 1) {
        word = word.replace(t, noew['设定'][0])
      } else if (tty === 2) {
        word = word.replace(t, noew['设定'][1])
      } else if (tty === 3) {
        word = word.replace(t, noew['设定'][2])
      } else {
        word = word.replace(t, '')
      }
      break
    }

    case ('取消'): {
      const st1:any = st.match(/\[(.*),(.*),(.*),(.*)\]/)
      st = `{"取消":["${st1[1]}","${st1[2]}",${Number(st1[3])},"${st1[4]}"]}`
      let use:any
      noew = JSON.parse(st)
      if (st1[4] === '0' || st1[4] === '') {
        use = getjson(id, 'user')
      } else {
        use = getjson(st1[4], 'user')
      }
      delete use[noew['取消'][0]][noew['取消'][1]]

      if (JSON.stringify(use[noew['取消'][0]]) === '{}') { delete use[noew['取消'][0]] }
      const tty:number = noew['取消'][2]

      if (st1[4] === '0' || st1[4] === '') {
        update(use, id, 'user')
      } else {
        update(use, st1[4], 'user')
      }

      if (tty === 1) {
        word = word.replace(t, noew['取消'][0])
      } else if (tty === 2) {
        word = word.replace(t, noew['取消'][1])
      } else {
        word = word.replace(t, '')
      }

      break
    }
    default: {
      break
    }
  }
  return word
}

// 词库引擎核心
const makereply = (word:any, id:string, aite:string, msg:any, matc:any, idList:any) => {
  while (/【.*】/.test(word)) {
    let t = word.match(/(.*?】).*/)[1]
    t = t.match(/.*(【.*?】)$/)[1]
    let st = t.match(/【(.*)】/)[1]
    const te = st.match(/(随机数字|判断|禁言|踢|解除禁言|艾特|添加|销毁|属性|延迟|发送名|发送id|数字|昵称|换行|取消|设定|id)/)[1]
    st = st.replace(te, '"' + te + '"')
    st = '{' + st + '}'
    word = toswitch(te, st, t, word, id, aite, msg, matc, idList)
  }
  while (/〖.*〗/.test(word)) {
    let t = word.match(/(.*?〗).*/)[1]
    t = t.match(/.*(〖.*?〗)$/)[1]
    let st = t.match(/〖(.*)〗/)[1]
    const te = st.match(/(随机数字|判断|禁言|踢|解除禁言|艾特|添加|销毁|属性|延迟|发送名|发送id|数字|昵称|换行|取消|设定|id)/)[1]
    st = st.replace(te, '"' + te + '"')
    st = '{' + st + '}'
    word = toswitch(te, st, t, word, id, aite, msg, matc, idList)
  }
  return word
}

// 解析输入化为输出
const input = (msage:string) => {
  let hello:any = []
  const out:any = []
  while (/(\d+)/.test(msage)) {
    hello = msage.match(/(\d+)/g)
    const test = hello[0]
    out.push(test)
    msage = msage.replace(test, '【数字】')
  }
  return out
}

const input2 = (msage:string) => {
  let hello:any = []
  const out:any = []
  let out1:any = []
  while (/(\[@.*?@\])/.test(msage)) {
    hello = msage.match(/\[@(.*?)@\]/g)
    const test = hello[0]
    out1 = test.match(/(\w+)/g)
    out.push(out1[0])
    msage = msage.replace(test, '【id】')
  }
  return out
}

// 核心功能：回复
api.Event.on('PublicMessage', msg => {
  if (msg.username === config.account.username) return // 不响应自己发送的消息
  let wd1: string = msg.message.trim()
  wd1 = wd1.replace(/\s/g, '')
  let over:any = []
  over = input(wd1)
  let idlist:any = []
  idlist = input2(wd1)
  const reply = api.method.sendPublicMessage
  const word = getjson('word', 'word')
  const wd2 = wd1.replace(/(\[\*.*\*\])/g, '【艾特】')
  let wd3 = wd2.replace(/(\[@.*@\])/g, '【id】')
  wd3 = wd3.replace(config.app.nickname, '【昵称】')
  const wd4:any = wd1.match(/.*\[\*(.*)\*\].*/) === null ? ['', ''] : wd1.match(/.*\[\*(.*)\*\].*/)
  const wd5 = wd1.replace(/(\d+)/g, '【数字】')
  try {
    if (word[wd1]) {
      logger('Word').info(`${msg.username} 触发了词库的 ${wd1}`)
      const ran: number = word[wd1].length
      const rd: number = random(0, ran - 1)
      const a:any = makereply(word[wd1][rd], msg.uid, wd4[1], msg, over, idlist)
      const out = a.split('#换#')
      let j:number = 0
      for (j = 0; j < out.length; j++) {
        if (out[j]) {
          reply(out[j], config.app.color)
        }
      }
    } else if (word[wd3]) {
      logger('Word').info(`${msg.username} 触发了词库的 ${wd3}`)
      const ran: number = word[wd3].length
      const rd: number = random(0, ran - 1)
      const a:any = makereply(word[wd3][rd], msg.uid, wd4[1], msg, over, idlist)
      const out = a.split('#换#')
      let j:number = 0
      for (j = 0; j < out.length; j++) {
        if (out[j]) {
          reply(out[j], config.app.color)
        }
      }
    } else if (word[wd5]) {
      logger('Word').info(`${msg.username} 触发了词库的 ${wd5}`)
      const ran: number = word[wd5].length
      const rd: number = random(0, ran - 1)
      const a:any = makereply(word[wd5][rd], msg.uid, wd4[1], msg, over, idlist)
      const out = a.split('#换#')
      let j:number = 0
      for (j = 0; j < out.length; j++) {
        if (out[j]) {
          reply(out[j], config.app.color)
        }
      }
    }
  } catch (error) {}
})

// 添加问答...
api.command(/^\.问(.*?)答(.*)$/, 'word.add', async (m, e, reply) => {
  try {
    if (!per.users.hasPermission(e.uid, 'word.op') && !per.users.hasPermission(e.uid, 'permission.word')) return reply('权限不足', config.app.color)
    const word = getjson('word', 'word')
    let wd1: string = m[1]// 问后面的内容
    const wd2: string = m[2]// 答后面的内容
    wd1 = wd1.replace(/\s/g, '')
    if (word[wd1] == null) {
      word[wd1] = []
    }
    const i = word[wd1].push(wd2)// 新增对象（属性

    update(word, 'word', 'word')
    reply('添加成功,当前序列为' + i, config.app.color)
  } catch (error) {}
})

// 删除部分问答
api.command(/^\.删问(.*?)序[号|列](.*)$/, 'word.delete.one', async (m, e, reply) => {
  try {
    if (!per.users.hasPermission(e.uid, 'word.op') && !per.users.hasPermission(e.uid, 'permission.word')) return reply('权限不足', config.app.color)
    const word = getjson('word', 'word')
    let wd1: string = m[1]// 问后面的内容
    const wd2 = Number(m[2]) - 1
    wd1 = wd1.replace(/\s/g, '')
    word[wd1].splice(wd2, 1)
    const passed = word[wd1].every(isError)
    if (passed === true) {
      delete word[wd1]
    }

    update(word, 'word', 'word')
    reply('删除成功', config.app.color)
  } catch (error) {}
})

// 查看词库list
api.command(/^\.问表(.*)$/, 'word.list', async (m, e, reply) => {
  try {
    if (!per.users.hasPermission(e.uid, 'word.op') && !per.users.hasPermission(e.uid, 'permission.word')) return reply('权限不足', config.app.color)
    const word = getjson('word', 'word')
    let wd1: string = m[1]
    wd1 = wd1.replace(/\s/g, '')
    let ran: number = 0
    for (const list of word[wd1]) {
      ran++
      reply(ran + ':' + list, config.app.color)
    }
  } catch (error) {}
})

// 删除一整个回复
api.command(/^\.删全问(.*)$/, 'word.delete.all', async (m, e, reply) => {
  try {
    if (!per.users.hasPermission(e.uid, 'word.op') && !per.users.hasPermission(e.uid, 'permission.word')) return reply('权限不足', config.app.color)
    let wd1: string = m[1]// 问后面的内容
    const word = getjson('word', 'word')
    wd1 = wd1.replace(/\s/g, '')
    delete word[wd1]

    update(word, 'word', 'word')
    reply('删除成功', config.app.color)
  } catch (error) {}
})
