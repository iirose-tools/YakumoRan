import fs from 'fs'
import path from 'path'

// 苏苏的随机数生成姬
const random = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n) }

/**
    * 返回一个文件的json对象
    * @param list 词库文件目录（wordconfig/userData/wordData）
    * @param name 词库文件名
    * @return 词库json对象
  */
const getjson = (list:string, name:string, dir:any) => {
  const wordPath = path.join(dir, `./word/${list}/${name}.json`)
  if (!fs.existsSync(wordPath)) {
    fs.writeFileSync(wordPath, '{}')
  }
  return JSON.parse(fs.readFileSync(wordPath).toString())
}

/**
    * 将词库json对象存储在文件内
    * @param list 词库文件目录
    * @param name 词库文件名
    * @param file 词库json对象
  */
const update = (list:string, name:string, file:any, dir:any) => {
  try {
    fs.writeFileSync(path.join(dir, `./word/${list}/${name}.json`), JSON.stringify(file, null, 3))
  } catch (error) {
  }
}

/**
  * 获取词库json对象
  * @return 词库json对象
  */
const getword = (dir:any) => {
  const fileName = path.join(dir, './word/wordData')
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

// 解析触发词
const parsing = (rawq:string) => {
  let tid:any
  let tname:any
  const numdata = []
  let q = rawq
  // 将各种情况的唯一标识转换为id
  if (q.match(/^\[@(.*?)@\]\s*/)) {
    tid = q.match(/^\[@(.*?)@\]\s*/)
  }
  if (q.match(/\s*\[@(.*?)@\]$/)) {
    tid = q.match(/\s*\[@(.*?)@\]$/)
  }
  if (q.match(/\s*\[@(.*?)@\]\s*/)) {
    tid = q.match(/\s*\[@(.*?)@\]\s*/)
  }
  if (q.match(/^\[@(.*?)@\]$/)) {
    tid = q.match(/^\[@(.*?)@\]$/)
  }

  let tha:any = null
  if (tid) {
    tha = tid[1]
    q = q.replace(tid[0], '(id)') // 我tm终于转换好了
  }

  // 将各种情况的艾特转换为@
  if (q.match(/^\[\*(.*?)\*\]\s*/)) {
    tname = q.match(/^\[\*(.*?)\*\]\s*/)
  }
  if (q.match(/\s*\[\*(.*?)\*\]$/)) {
    tname = q.match(/\s\[\*(.*?)\*\]$/)
  }
  if (q.match(/\s*\[\*(.*?)\*\]\s*/)) {
    tname = q.match(/\s*\[\*(.*?)\*\]\s*/)
  }
  if (q.match(/^\[\*(.*?)\*\]$/)) {
    tname = q.match(/^\[\*(.*?)\*\]$/)
  }
  let name = ''
  if (tname) {
    name = tname[1]
    q = q.replace(tname[0], '(@)') // 我tm终于转换好了
  }

  // 将数字替换为(数)
  while (q.match(/(\d+)/)) {
    const reg = q.match(/(\d+)/)
    if (reg) {
      numdata.push(reg[1])
      q = q.replace(reg[0], '(数)')
    }
  }

  return [q, tha, name, numdata]
}

// 常规替换
const replaceWord = (q:string, wd:string, nam:string, numdata:any, uid:string, userName:string, name:string, nickname:string) => {
  // 将$数$替换为数
  while (wd.match(/\$数(.*?)\$/)) {
    const reg = wd.match(/\$数(.*?)\$/)
    if (reg) {
      const index = Number(reg[1]) - 1
      wd = wd.replace(reg[0], String(numdata[index]))
    }
  }

  // 将$id$变为发送人id
  while (wd.match(/\$id\$/)) {
    if (wd.match(/\$id\$/)) {
      const over = wd.match(/\$id\$/)
      if (over) {
        wd = wd.replace(over[0], uid)
      }
    }
  }

  // 将$发$变为发送者名字
  while (wd.match(/\$发\$/)) {
    if (wd.match(/\$发\$/)) {
      const over = wd.match(/\$发\$/)
      if (over) {
        wd = wd.replace(over[0], userName)
      }
    }
  }

  // 将$@$变为问中的@
  while (wd.match(/\$@\$/)) {
    if (wd.match(/\$@\$/)) {
      const over = wd.match(/\$@\$/)
      try {
        if (over) {
          wd = wd.replace(over[0], name)
        }
      } catch (err) {
        throw new Error(`  【 词库核心 】  [${q}]   无法获取对应数据`)
      }
    }
  }

  // 将$称$变为机器人昵称
  while (wd.match(/\$称\$/)) {
    if (wd.match(/\$称\$/)) {
      const over = wd.match(/\$称\$/)

      if (over) {
        wd = wd.replace(over[0], nickname)
      }
    }
  }

  // 将$xx~xx$替换为随机数
  while (wd.match(/\$(\d+)~(\d+)\$/)) {
    const reg = wd.match(/\$(\d+)~(\d+)\$/)
    if (reg) {
      wd = wd.replace(reg[0], String(random(Number(reg[1]), Number(reg[2]))))
    }
  }
  return wd
}

// 条件判断类
const condition = (wd:string, tha:string, uid:string, dir:any, userName:string, q:string) => {
  // 优先获取属性  `物品名 目标`
  while (wd.match(/`(.*?)`/)) {
    const end = wd.match(/`(.*?)`/)
    if (end) {
      const endData = end[1].split(' ')
      let mubiao = ''
      if (endData.length === 2) {
        mubiao = (endData[1] === 'that') ? (tha) : (endData[1])
      } else {
        mubiao = uid
      }
      const data = getjson('userData', mubiao, dir)
      if (endData[0].substring(0, 2) === '武器' || endData[0].substring(0, 2) === '防具' || endData[0].substring(0, 2) === '技能' || endData[0].substring(0, 2) === '道具') {
        if (endData[0].substring(2, 3)) {
          if (endData[0].substring(2, 3) === '名') { wd = wd.replace(end[0], data[endData[0].substring(0, 2)].name) }
          if (endData[0].substring(2, 3) === '值') { wd = wd.replace(end[0], data[endData[0].substring(0, 2)].value) }
        }
      } else if (endData[0].substring(0, 3) === 'str') {
        const name = endData[0].replace('str', '')
        if (!data[name]) { data[name] = [] }
        const listData = name.split(':')
        if (listData.length === 1) {
          wd = wd.replace(end[0], data[name].join('，'))
        } else {
          const ran = listData[1].split('~')
          if (ran.length === 1) {
            wd = wd.replace(end[0], data[listData[0]][Number(listData[1]) - 1])
          } else {
            wd = (ran[1] !== 'all') ? (wd.replace(end[0], data[listData[0]][random(Number(ran[0]), Number(ran[1])) - 1])) : (wd.replace(end[0], data[listData[0]][random(Number(ran[0]), data[listData[0]].length) - 1]))
          }
        }
      } else {
        const out = Number((data[endData[0]]) ? data[endData[0]] : 0)
        wd = wd.replace(end[0], String(out))
      }
    }
  }

  // 延迟
  while (wd.match(/\^(\d+)\s(.*?)\^/)) {
    const load = wd.match(/\^(\d+)\s(.*?)\^/)
    if (load) {
      const now = Date.parse(new Date().toString()) / 1000
      const nowlist = getjson('wordconfig', 'timelist', dir)
      if (!nowlist[uid]) { nowlist[uid] = {} }
      if (!nowlist[uid][load[2]]) {
        nowlist[uid][load[2]] = Number(now + Number(load[1]))
        wd = wd.replace(load[0], load[2])
      } else {
        if (nowlist[uid][load[2]] > now) {
          throw new Error(`  【 词库核心: ${userName} 】  ${q} 任务未完成...`)
        } else {
          nowlist[uid][load[2]] = Number(now + Number(load[1]))
          wd = wd.replace(load[0], load[2])
        }
      }
      update('wordconfig', 'timelist', nowlist, dir)
    }
  }

  // 静默延迟
  while (wd.match(/\^(\d+):(\d)\s(.*?)\^/)) {
    const load = wd.match(/\^(\d+):(\d)\s(.*?)\^/)
    if (load) {
      const now = Date.parse(new Date().toString()) / 1000
      const nowlist = getjson('wordconfig', 'timelist', dir)
      if (!nowlist[uid]) { nowlist[uid] = {} }
      if (!nowlist[uid][load[3]]) {
        nowlist[uid][load[3]] = Number(now + Number(load[1]))
        wd = wd.replace(load[0], load[3])
      } else {
        if (nowlist[uid][load[3]] > now) {
          return ''
        } else {
          nowlist[uid][load[2]] = Number(now + Number(load[1]))
          wd = wd.replace(load[0], load[3])
        }
      }
      update('wordconfig', 'timelist', nowlist, dir)
    }
  }

  // 判断管理员命令
  while (wd.match(/{(.*?)}/)) {
    if (wd.match(/{(.*?)}/)) {
      const over = wd.match(/{(.*?)}/)
      try {
        if (over) {
          const admin = getjson('wordconfig', 'adminlist', dir)
          if (admin.admin.indexOf(uid) >= 0) {
            wd = wd.replace(over[0], over[1])
          } else {
            wd = wd.replace(over[0], '')
          }
        }
      } catch (err) {
        throw new Error(`  【 词库核心 】  [${q}]   无法获取对应数据`)
      }
    }
  }

  // 开始解析判断    ?物品名<>=<>数量 语句?
  while (wd.match(/\?(.*?)\s(.*?)\s(.*?)\s(.*?)\?/)) {
    const first = wd.match(/\?(.*?)\s(.*?)\s(.*?)\s(.*?)\?/)
    if (first) {
      const target = first[1].split(':')
      let mData:any
      let item = ''
      if (target.length === 1) {
        mData = getjson('userData', uid, dir)
        item = first[1]
      }

      if (target.length === 2) {
        mData = (target[1] === 'that') ? (getjson('userData', tha, dir)) : (getjson('userData', target[1], dir))
        item = target[0]
      }
      let out = ''

      if (!mData[item]) { mData[item] = 0 }
      // 加上数字判断
      if (first[2] === '<' && mData[item] < Number(first[3])) { out = first[4] }
      if (first[2] === '>' && mData[item] > Number(first[3])) { out = first[4] }
      if (first[2] === '=' && mData[item] === Number(first[3])) { out = first[4] }
      if (first[2] === '<>' && mData[item] !== Number(first[3])) { out = first[4] }
      if (first[2] === '>=' && mData[item] >= Number(first[3])) { out = first[4] }
      if (first[2] === '<=' && mData[item] <= Number(first[3])) { out = first[4] }
      wd = wd.replace(first[0], out)
    }
  }

  // 开始解析概率    %30 语句%
  while (wd.match(/%(.*?)\s(.*?)%/)) {
    const next1 = wd.match(/%(.*?)\s(.*?)%/)
    if (next1) {
      const num = random(0, 100)
      if (num < Number(next1[1])) {
        wd = wd.replace(next1[0], next1[2])
      } else {
        wd = wd.replace(next1[0], '什么都木有')
      }
    }
  }

  return wd
}

// 掉落物品
const loss = (wd:string, tha:string, dir:any, uid:string, things:any, thingnum:number, userName:string) => {
// 开始解析减少     -物品名 数量 目标/that-
  while (wd.match(/-(.*?)-/)) {
    const third = wd.match(/-(.*?)-/)
    if (third) {
      let outNumber:number
      const mData = third[1].split(' ')
      let mubiao = ''
      if (mData.length >= 3) { // 如果有3个参数
        mubiao = (mData[2] === 'that' && tha) ? (tha) : (mData[2])
      } else {
        mubiao = uid
      }
      const user = getjson('userData', mubiao, dir)
      if (mData[0].substring(0, 2) === '武器' || mData[0].substring(0, 2) === '防具' || mData[0].substring(0, 2) === '道具' || mData[0].substring(0, 2) === '技能') {
        if (!user[mData[0].substring(0, 2)]) { user[mData[0].substring(0, 2)] = { name: '', value: 0 } }
        const name = user[mData[0].substring(0, 2)].name
        thingnum++
        things[String(thingnum)] = [mubiao, mData[0].substring(0, 2), user[mData[0].substring(0, 2)], 'other1']
        if (mData[1].search('~') >= 0) {
          const num = mData[1].split('~')
          outNumber = random(Number(num[0]), Number(num[1]))
        } else {
          outNumber = (mData[1] === 'all') ? (user[mData[0].substring(0, 2)].name) : (Number(mData[1]))
        }
        user[mData[0].substring(0, 2)].value = user[mData[0].substring(0, 2)].value - outNumber
        if (!user[mData[0].substring(0, 2)].value || user[mData[0].substring(0, 2)].value <= 0) { delete user[mData[0].substring(0, 2)] }
        update('userData', mubiao, user, dir)
        if (user[mData[0].substring(0, 2)]) { wd = wd.replace(third[0], String(user[mData[0].substring(0, 2)].value)) }
        if (!user[mData[0].substring(0, 2)]) { wd = wd.replace(third[0], name) }
      } else if (mData[0].substring(0, 3) === 'str') {
        const name = mData[0].replace('str', '')
        if (!user[name]) { user[name] = [] }
        if (mData[1] === 'all') {
          thingnum++
          things[String(thingnum)] = [mubiao, mData[0].substring(0, 2), user[mData[0].substring(0, 2)], 'other1']
          delete user[name]
          wd = wd.replace(third[0], '无')
        } else if (user[name].indexOf(mData[1]) >= 0) {
          thingnum++
          things[String(thingnum)] = [mubiao, mData[0].substring(0, 2), user[mData[0].substring(0, 2)], 'other1']
          user[name].splice(user[name].indexOf(mData[1]), 1)
          if (!user[name].length) { delete user[name] }
          wd = wd.replace(third[0], mData[1])
        } else {
          losserr(things, dir)
          throw new Error(`  [ 词库核心 ]  【${userName}】  似乎失败了...唔..好像没有物品【${name}】`)
        }
        update('userData', mubiao, user, dir)
      } else {
        if (!user[mData[0]]) { user[mData[0]] = 0 }
        if (mData[1].search('~') >= 0) {
          const num = mData[1].split('~')
          outNumber = random(Number(num[0]), Number(num[1]))
        } else {
          outNumber = (mData[1] === 'all') ? (user[mData[0]]) : (Number(mData[1]))
        }
        user[mData[0]] = (user[mData[0]] * 1000 - outNumber * 1000) / 1000
        if (user[mData[0]] < 0) {
          losserr(things, dir)
          throw new Error(`  [ 词库核心 ]  【${userName}】  似乎失败了...唔..好像物品【${mData[0]}】不够`)
        }
        thingnum++
        things[String(thingnum)] = [mubiao, mData[0], outNumber, '-']
        update('userData', mubiao, user, dir)
        wd = wd.replace(third[0], String(outNumber))
      }
    }
  }
  return wd
}

// 添加物品
const add = (wd:string, tha:string, dir:any, uid:string, things:any, thingnum:number) => {
  // 开始解析添加    +物品名 数量 目标/that+
  while (wd.match(/\+(.*?)\+/)) {
    const second = wd.match(/\+(.*?)\+/)
    if (second) {
      const mData = second[1].split(' ')
      let mubiao = ''
      if (mData.length >= 3) {
        mubiao = (mData[2] === 'that' && tha) ? (tha) : (mData[2])
      } else {
        mubiao = uid
      }
      const user = getjson('userData', mubiao, dir)
      if (mData[0].substring(0, 2) === '武器' || mData[0].substring(0, 2) === '防具' || mData[0].substring(0, 2) === '道具' || mData[0].substring(0, 2) === '技能') {
        if (!user[mData[0].substring(0, 2)]) { user[mData[0].substring(0, 2)] = { name: '', value: 0 } }
        const name = mData[0].replace(mData[0].substring(0, 2), '')
        thingnum++
        things[String(thingnum)] = [mubiao, [mData[0].substring(0, 2), name], user[mData[0].substring(0, 2)], 'other1']
        const outnum = Number((mData[1].search('~') >= 0) ? (random(Number(mData[1].split('~')[0]), Number(mData[1].split('~')[1]))) : Number(mData[1]))
        if (outnum > user[mData[0].substring(0, 2)].value) {
          user[mData[0].substring(0, 2)] = {
            name: name,
            value: outnum
          }
          update('userData', mubiao, user, dir)
          wd = wd.replace(second[0], `${name}，强度${outnum}`)
        } else {
          throw new Error('  [词库核心]  当前背包内的武器可能更好哦~本次获得的装备已被丢弃')
        }
      } else if (mData[0].substring(0, 3) === 'str') {
        const name = mData[0].replace('str', '')
        if (!user[name]) { user[name] = [] }
        thingnum++
        things[String(thingnum)] = [mubiao, name, user[name], 'other2']
        if (user[name].indexOf(mData[1]) === -1) {
          user[name].push(String(mData[1]))
        }
        update('userData', mubiao, user, dir)
        wd = wd.replace(second[0], String(mData[1]))
      } else {
        if (!user[mData[0]]) { user[mData[0]] = 0 }
        let outNumber = 0
        if (mData[1] === 'all') {
          outNumber = user[mData[0]]
        } else {
          outNumber = (mData[1].search('~') >= 0) ? (random(Number(mData[1].split('~')[0]), Number(mData[1].split('~')[1]))) : Number(mData[1])
        }
        user[mData[0]] = (outNumber * 1000 + user[mData[0]] * 1000) / 1000
        update('userData', mubiao, user, dir)
        thingnum++
        things[String(thingnum)] = [mubiao, mData[0], outNumber, '+']
        wd = wd.replace(second[0], String(outNumber))
      }
    }
  }

  return wd
}

// 反馈减少的错误
const losserr = (things:any, dir:any) => {
  for (let n = Object.keys(things).length; n > 0; n--) {
    const json = things[n]
    const data = getjson('userData', json[0], dir)
    if (json[3] === '-') { data[json[1]] = data[json[1]] + json[2] }
    if (json[3] === '+') { data[json[1]] = data[json[1]] - json[2] }
    if (json[3] === 'other1') { data[json[1]] = json[2] }
    if (json[3] === 'other2') { data[json[1]] = json[2] }
    update('userData', json[0], data, dir)
  }
}

const attribute = (wd:string, tha:string, dir:any, uid:string) => {
  // 获取属性  #物品名 目标#
  while (wd.match(/#(.*?)#/)) {
    const end = wd.match(/#(.*?)#/)
    if (end) {
      const endData = end[1].split(' ')
      let mubiao = ''
      if (endData.length === 2) {
        mubiao = (endData[1] === 'that') ? (tha) : (endData[1])
      } else {
        mubiao = uid
      }
      const data = getjson('userData', mubiao, dir)
      if (endData[0].substring(0, 2) === '武器' || endData[0].substring(0, 2) === '防具' || endData[0].substring(0, 2) === '道具' || endData[0].substring(0, 2) === '技能') {
        if (endData[0].substring(2, 3)) {
          if (endData[0].substring(2, 3) === '名') { wd = wd.replace(end[0], data[endData[0].substring(0, 2)].name) }
          if (endData[0].substring(2, 3) === '值') { wd = wd.replace(end[0], data[endData[0].substring(0, 2)].value) }
        }
      } else if (endData[0].substring(0, 3) === 'str') {
        const name = endData[0].replace('str', '')
        if (!data[name]) { data[name] = [] }
        const listData = name.split(':')
        if (listData.length === 1) {
          wd = wd.replace(end[0], data[name].join('，'))
        } else {
          const ran = listData[1].split('~')
          if (ran.length === 1) {
            wd = wd.replace(end[0], data[listData[0]][Number(listData[1]) - 1])
          } else {
            wd = (ran[1] !== 'all') ? (wd.replace(end[0], data[listData[0]][random(Number(ran[0]), Number(ran[1])) - 1])) : (wd.replace(end[0], data[listData[0]][random(Number(ran[0]), data[listData[0]].length) - 1]))
          }
        }
      } else {
        const out = Number((data[endData[0]]) ? data[endData[0]] : 0)
        wd = wd.replace(end[0], String(out))
      }
    }
  }

  // 将$换$变为
  while (wd.match(/\$换\$/)) {
    if (wd.match(/\$换\$/)) {
      const over = wd.match(/\$换\$/)
      if (over) {
        wd = wd.replace(over[0], '\n')
      }
    }
  }

  return wd
}

// 标记不需要解析的区域
const saveValue = (wd:string, forbiddenPars:any) => {
  let time = 0
  while (wd.match(/\$\[(.*?)\]\$/)) {
    if (wd.match(/\$\[(.*?)\]\$/)) {
      const over = wd.match(/\$\[(.*?)\]\$/)
      if (over) {
        forbiddenPars.push(over[1])
        wd = wd.replace(over[0], `[${time}]`)
      }
    }
    time = time + 1
  }

  return wd
}

export const analysis = {
  /**
    * 词库解析
    * @param rawq 需要回复的触发词
    * @param m 触发者的数据json:{uid:'id',name:'昵称'}
    * @return 返回为回复结果
  */
  start (rawq:string, m:any, dir:any, nickname:string) {
    const uid:string = m.uid
    const userName:string = m.username
    const forbiddenPars:any = []
    // 将唯一标识转换为id
    let wd = ''

    // 解析触发词
    const psr = parsing(rawq)
    const q = psr[0]
    const tha = psr[1]
    const name = psr[2]
    const numdata = psr[3]

    // 获取全部的词库
    if (getword(dir)[rawq]) {
      const num = random(0, getword(dir)[rawq].length - 1)
      wd = getword(dir)[rawq][num]
      console.log(`  【 词库核心 】  已触发词库   【${rawq}】 `)
    } else if (getword(dir)[q]) {
      const num = random(0, getword(dir)[q].length - 1)
      wd = getword(dir)[q][num]
      console.log(`  【 词库核心 】  已触发词库   【${q}】 `)
    } else {
      return null
    }

    // 收集减法/加法本次干了啥，失败则恢复这些记录
    const things:any = {}
    const thingnum = 0

    try {
      // 将不需要进行解析的文本存储
      wd = saveValue(wd, forbiddenPars)

      // 输入替换
      wd = replaceWord(q, wd, name, numdata, uid, userName, name, nickname)

      // 输出常规替换与判断
      wd = condition(wd, tha, uid, dir, userName, q)

      // 减少物品
      wd = loss(wd, tha, dir, uid, things, thingnum, userName)

      // 添加物品
      wd = add(wd, tha, dir, uid, things, thingnum)

      // 最后检测及换行
      wd = attribute(wd, tha, dir, uid)

      // 将不需要解析的值放出
      if (forbiddenPars.length) {
        forbiddenPars.forEach(function (item:string, index:number) {
          wd = wd.replace(`[${index}]`, item)
        })
      }
    } catch (err:any) {
      return err.message
    }

    if (wd) {
      return wd
    } else {
      return null
    }
  }
}
