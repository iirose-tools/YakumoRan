import fs from 'fs'
import path from 'path'
import * as api from '../../lib/api'
import config from '../../config'
import per from '../permission/permission'
import { plugin } from '../manager'

const flag = {
  status: true
}

plugin.on('word', status => {
  flag.status = status
})

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
const toswitch = (te:string, st:string, t:string, word:any, id:string, aite:string, msg:any, matc:any, idc:any) => {
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
      update(use, id, 'user')
      const tty:number = noew['添加'][3]
      if (tty === 0) {
        word = word.replace(t, '添加成功')
      }
      if (tty === 1) {
        word = word.replace(t, String(noew['添加'][0]))
      }
      if (tty === 2) {
        word = word.replace(t, String(noew['添加'][1]))
      }
      if (tty === 3) {
        word = word.replace(t, String(noew['添加'][2]))
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
      if (use[noew['销毁'][0]] === {}) {
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
      update(use, id, 'user')
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
      }
      if (tty === 2) {
        if (wd6 === 1) {
          word = word.replace(t, String(noew['销毁'][1]))
        } else if (wd6 === 0) {
          word = word.replace(t, -1)
        }
      }
      if (tty === 3) {
        if (wd6 === 1) {
          word = word.replace(t, String(noew['销毁'][2]))
        } else if (wd6 === 0) {
          word = word.replace(t, -1)
        }
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
      const st1:any = st.match(/\[(.*),(.*)\]/)
      st = `{"id":[${Number(st1[1])},${Number(st1[2])}]}`
      noew = JSON.parse(st)

      if (noew.id[0] === 1) {
        word = word.replace(t, ` [@${idc[noew.id[0] - 1]}@] `)
      }
      if (noew.id[0] === 2) {
        word = word.replace(t, idc[noew.id[0] - 1])
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
const makereply = (word:any, id:string, aite:string, msg:any, matc:any, idc:any) => {
  while (/【.*】/.test(word)) {
    let t = word.match(/(.*?】).*/)[1]
    t = t.match(/.*(【.*?】)$/)[1]
    let st = t.match(/【(.*)】/)[1]
    const te = st.match(/(随机数字|判断|禁言|踢|解除禁言|艾特|添加|销毁|属性|延迟|发送名|发送id|数字|id)/)[1]
    st = st.replace(te, '"' + te + '"')
    st = '{' + st + '}'
    word = toswitch(te, st, t, word, id, aite, msg, matc, idc)
  }
  while (/〖.*〗/.test(word)) {
    let t = word.match(/(.*?〗).*/)[1]
    t = t.match(/.*(〖.*?〗)$/)[1]
    let st = t.match(/〖(.*)〗/)[1]
    const te = st.match(/(随机数字|判断|禁言|踢|解除禁言|艾特|添加|销毁|属性|延迟|发送名|发送id|数字|id)/)[1]
    st = st.replace(te, '"' + te + '"')
    st = '{' + st + '}'
    word = toswitch(te, st, t, word, id, aite, msg, matc, idc)
  }
  return word
}

// 解析输入化为输出
const inputMath = (msage:string) => {
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

// 解析id为化为输出
const inputId = (msage:string) => {
  let hello:any = []
  const out:any = []
  while (/\[@(.*?)@\]/.test(msage)) {
    hello = msage.match(/\[@(.*?)@\]/g)
    const hello2 = hello[0]
    const test = /@(.*)@/.exec(hello2)
    if (test) {
      out.push(test[1])
      msage = msage.replace(`[@${test[1]}@]`, '【id】')
    }
  }
  return out
}
if (flag.status) {
// 核心功能：回复
  api.Event.on('PublicMessage', msg => {
    if (msg.username === config.account.username) return // 不响应自己发送的消息
    let wd1: string = msg.message.trim()
    wd1 = wd1.replace(/\s/g, '')
    let over:any = []
    let over2:any = []
    over = inputMath(wd1)
    over2 = inputId(wd1)
    const reply = api.method.sendPublicMessage
    const word = getjson('word', 'word')
    const wd2 = wd1.replace(/(\[\*.*?\*\])/g, '【艾特】')
    const wd3 = wd2.replace(/(\[@.*?@\])/g, '【id】')
    const wd4:any = wd1.match(/.*\[\*(.*)\*\].*/) === null ? ['', ''] : wd1.match(/.*\[\*(.*)\*\].*/)
    const wd5 = wd1.replace(/(\d+)/g, '【数字】')
    try {
      if (word[wd1]) {
        const ran: number = word[wd1].length
        const rd: number = random(0, ran - 1)
        const a:any = makereply(word[wd1][rd], msg.uid, wd4[1], msg, over, over2)
        const out = a.split('#换#')
        let j:number = 0
        for (j = 0; j < out.length; j++) {
          if (out[j]) {
            reply(out[j], config.app.color)
          }
        }
      } else if (word[wd3]) {
        const ran: number = word[wd3].length
        const rd: number = random(0, ran - 1)
        const a:any = makereply(word[wd3][rd], msg.uid, wd4[1], msg, over, over2)
        const out = a.split('#换#')
        let j:number = 0
        for (j = 0; j < out.length; j++) {
          if (out[j]) {
            reply(out[j], config.app.color)
          }
        }
      } else if (word[wd5]) {
        const ran: number = word[wd5].length
        const rd: number = random(0, ran - 1)
        const a:any = makereply(word[wd5][rd], msg.uid, wd4[1], msg, over, over2)
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
}

// 添加问答...
api.command(/^\.问(.*?)答(.*)$/, 'word.add', async (m, e, reply) => {
  if (!flag.status) return reply('[word] 功能未启用')
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
  if (!flag.status) return reply('[word] 功能未启用')
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
  if (!flag.status) return reply('[word] 功能未启用')
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
  if (!flag.status) return reply('[word] 功能未启用')
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
