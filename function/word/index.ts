import fs from 'fs'
import path from 'path'
import * as api from '../../lib/api'
import config from '../../config'

try {
  fs.mkdirSync(path.join(api.Data, './word/user'))
  fs.mkdirSync(path.join(api.Data, './word/word'))
  fs.mkdirSync(path.join(api.Data, './word/op'))
} catch (error) {}

// 判断error
const isError = (element: any, index: any, array: any) => {
  return (element === null)
}

// 过滤
const fitter = (txt: string) => {
  txt = txt.replace(/[@[\] ]/g, '')
  return txt
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
const toswitch = (te:string, st:string, t:string, word:any, use:any, id:string, aite:string) => {
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
          if (isNaN(Number(noew['判断'][0]))) {
            if (!isNaN(Number(noew['判断'][2]))) {
              if (use['属性'][noew['判断'][0]] > Number(noew['判断'][2])) {
                a = noew['判断'][3]
              } else {
                a = noew['判断'][4]
              }
            }
          } else {
            if (Number(noew['判断'][0]) > Number(noew['判断'][2])) {
              a = noew['判断'][3]
            } else {
              a = noew['判断'][4]
            }
          }
          break
        }
        case ('='): {
          if (isNaN(Number(noew['判断'][0]))) {
            if (!isNaN(Number(noew['判断'][2]))) {
              if (use['属性'][noew['判断'][0]] === Number(noew['判断'][2])) {
                a = noew['判断'][3]
              } else {
                a = noew['判断'][4]
              }
            }
          } else {
            if (Number(noew['判断'][0]) === Number(noew['判断'][2])) {
              a = noew['判断'][3]
            } else {
              a = noew['判断'][4]
            }
          }
          break
        }
        case ('<'): {
          if (isNaN(Number(noew['判断'][0]))) {
            if (!isNaN(Number(noew['判断'][2]))) {
              if (use['属性'][noew['判断'][0]] < Number(noew['判断'][2])) {
                a = noew['判断'][3]
              } else {
                a = noew['判断'][4]
              }
            }
          } else {
            if (Number(noew['判断'][0]) < Number(noew['判断'][2])) {
              a = noew['判断'][3]
            } else {
              a = noew['判断'][4]
            }
          }
          break
        }
        case ('<>'): {
          if (isNaN(Number(noew['判断'][0]))) {
            if (!isNaN(Number(noew['判断'][2]))) {
              if (use['属性'][noew['判断'][0]] !== Number(noew['判断'][2])) {
                a = noew['判断'][3]
              } else {
                a = noew['判断'][4]
              }
            }
          } else {
            if (Number(noew['判断'][0]) !== Number(noew['判断'][2])) {
              a = noew['判断'][3]
            } else {
              a = noew['判断'][4]
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
      const st1:any = st.match(/\[(.*),(.*),(.*)\]/)
      st = `{"添加":["${st1[1]}","${st1[2]}",${Number(st1[3])}]}`
      noew = JSON.parse(st)
      if (use[noew['添加'][0]] == null) { use[noew['添加'][0]] = [] }
      if (use['属性'] == null) { use['属性'] = {} }
      use[noew['添加'][0]][0] = noew['添加'][1]
      use[noew['添加'][0]][1] = Number(noew['添加'][2])
      if (use['属性'][noew['添加'][1]] == null) { use['属性'][noew['添加'][1]] = 0 }
      use['属性'][noew['添加'][1]] = Number(use['属性'][noew['添加'][1]]) + Number(noew['添加'][2])
      update(use, id, 'user')
      word = word.replace(t, noew['添加'][0])
      break
    }
    case ('销毁'): {
      const st1:any = st.match(/\[(.*),(.*)\]/)
      st = `{"销毁":["${st1[1]}","${st1[2]}"]}`
      noew = JSON.parse(st)
      use['属性'][use[noew['销毁'][0]][0]] = use['属性'][use[noew['销毁'][0]][0]] - Number(noew['销毁'][1])
      if (use['属性'][use[noew['销毁'][0]][0]] === 0) { delete use['属性'][use[noew['销毁'][0]][0]] }
      delete use[noew['销毁'][0]]
      update(use, id, 'user')
      word = word.replace(t, noew['销毁'][0])
      break
    }
    default: {
      break
    }
  }
  return word
}

// 词库引擎核心
const makereply = (word:any, id:string, aite:string) => {
  const use = getjson(id, 'user')
  while (/【.*】/.test(word)) {
    let t = word.match(/(.*?】).*/)[1]
    t = t.match(/.*(【.*?】)$/)[1]
    let st = t.match(/【(.*)】/)[1]
    const te = st.match(/(随机数字|判断|禁言|踢|解除禁言|艾特|添加|销毁)/)[1]
    st = st.replace(te, '"' + te + '"')
    st = '{' + st + '}'
    word = toswitch(te, st, t, word, use, id, aite)
  }
  while (/〖.*〗/.test(word)) {
    let t = word.match(/(.*?〗).*/)[1]
    t = t.match(/.*(〖.*?〗)$/)[1]
    let st = t.match(/〖(.*)〗/)[1]
    const te = st.match(/(随机数字|判断|禁言|踢|解除禁言|艾特|添加|销毁)/)[1]
    st = st.replace(te, '"' + te + '"')
    st = '{' + st + '}'
    console.log(st)
    word = toswitch(te, st, t, word, use, id, aite)
  }
  return word
}

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
  if (op.op.includes(name)) {
    return true
  } else {
    return false
  }
}

// 获取op
const getAdmin = () => {
  const opPath = path.join(process.cwd(), './data/word/op/op.json')
  if (!fs.existsSync(opPath)) {
    fs.writeFileSync(opPath, '{"admin":[],"op":[]}')
  }

  return JSON.parse(fs.readFileSync(opPath).toString())
}

// 核心功能：回复
api.Event.on('PublicMessage', msg => {
  if (msg.username === config.account.username) return // 不响应自己发送的消息
  let wd1: string = msg.message.trim()
  wd1 = wd1.replace(/\s/g, '')
  const reply = api.method.sendPublicMessage
  const word = getjson('word', 'word')
  const wd2 = wd1.replace(/(\[\*.*\*\])/g, '【艾特】')
  const wd3 = wd2.replace(/(\[@.*@\])/g, '【uid】')
  const wd4:any = wd1.match(/.*\[\*(.*)\*\].*/) === null ? ['', ''] : wd1.match(/.*\[\*(.*)\*\].*/)
  try {
    if (word[wd1]) {
      const ran: number = word[wd1].length
      const rd: number = random(0, ran - 1)
      const a:any = makereply(word[wd1][rd], msg.uid, wd4[1])
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
      const a:any = makereply(word[wd3][rd], msg.uid, wd4[1])
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
api.command(/^\.问(.*)答(.*)$/, async (m, e, reply) => {
  if (!isAdmin(e.uid) && e.uid !== config.app.master_uid && !isOp(e.uid)) return
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
})

// 删除部分问答
api.command(/^\.删问(.*)序[号|列](.*)$/, async (m, e, reply) => {
  if (!isAdmin(e.uid) && e.uid !== config.app.master_uid && !isOp(e.uid)) return
  const word = getjson('word', 'word')
  const wd1: string = m[1]// 问后面的内容
  const wd2 = Number(m[2]) - 1
  word[wd1].splice(wd2, 1)
  const passed = word[wd1].every(isError)
  if (passed === true) {
    delete word[wd1]
  }

  update(word, 'word', 'word')
  reply('删除成功', config.app.color)
})

// 查看词库list
api.command(/^\.问表(.*)$/, async (m, e, reply) => {
  if (!isAdmin(e.uid) && e.uid !== config.app.master_uid && !isOp(e.uid)) return
  const word = getjson('word', 'word')
  const wd1: string = m[1]
  let ran: number = 0
  for (const list of word[wd1]) {
    ran++
    reply(ran + ':' + list, config.app.color)
  }
})

// 删除一整个回复
api.command(/^\.删全问(.*)$/, async (m, e, reply) => {
  if (!isAdmin(e.uid) && e.uid !== config.app.master_uid && !isOp(e.uid)) return
  const wd1: string = m[1]// 问后面的内容
  const word = getjson('word', 'word')

  delete word[wd1]

  update(word, 'word', 'word')
  reply('删除成功', config.app.color)
})

// 饼修改的部分：
api.command(/^.添加权限(.*):(.*)$/, async (m, e, reply) => {
  // 只允许master和admin进行该操作。
  let added: string = m[1]
  added = fitter(added)
  const allowed = getAdmin()

  if (m[2] === '高级') {
    if (e.uid !== config.app.master_uid) return
    allowed.admin.push(added)
    update(allowed, 'op', 'op')
    reply('高级权限添加成功', config.app.color)
  }
  if (m[2] === '普通') {
    if (e.uid !== config.app.master_uid && !isAdmin(e.uid)) return
    allowed.op.push(added)
    update(allowed, 'op', 'op')
    reply('权限添加成功', config.app.color)
  }
})

api.command(/^.移除权限(.*):(.*)$/, async (m, e, reply) => {
  // 只允许master和admin进行该操作。
  let username: string = m[1]
  username = fitter(username)
  const allowed = getAdmin()

  if (m[2] === '高级') {
    if (e.uid !== config.app.master_uid) return
    allowed.admin.forEach(function (item: any, index: any, arr: any) {
      if (item === username) {
        allowed.admin.splice(index, 1)
      }
    })
    update(allowed, 'op', 'op')
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
    update(allowed, 'op', 'op')
    // 将username写到一个json里...然后我研究下怎么写json...哎。
    reply('权限移除成功', config.app.color)
  }
  // 找到并删除。
})
