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

// 定义全局变量
let wd:string
let dir:any
let tha:string
let uid:string
let things:any
let thingnum:any
let userName:string
let q:string

// 优先获取属性  `物品名 目标`
const givePriorityToQuery = () => {
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
          wd = wd.replace(end[0], data[name].join('\n'))
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
}

// ***开始解析概率    %30 语句%
const time = () => {
  const day = new Date()
  while (wd.match(/\$时间\$/)) {
    const next1 = wd.match(/\$时间\$/)
    if (next1) {
      wd = wd.replace(next1[0], `${day.getFullYear()}.${day.getMonth()}.${day.getDate()} ${day.getHours()}:${day.getMinutes()}:${day.getMilliseconds()}`)
    }
  }
}

// ***延迟判断
const suspendJudgment = () => {
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
}

// 静默延迟
const suspendJudgmentInSilence = () => {
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
          wd = wd.replace(load[0], '')
          return ''
        } else {
          nowlist[uid][load[3]] = Number(now + Number(load[1]))
          wd = wd.replace(load[0], load[3])
        }
      }
      update('wordconfig', 'timelist', nowlist, dir)
    }
  }
}

// 判断管理员命令
const administratorDetermine = () => {
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
}

// 开始解析判断    ?物品名<>=<>数量 语句?
const numberOf = () => {
  while (wd.match(/\?([^?\s]+?)\s([^?]+?)\s([^?]+?)\s([^?]+)\?/)) {
    const first = wd.match(/\?([^?\s]+?)\s([^?]+?)\s([^?]+?)\s([^?]+)\?/)
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

  while (wd.match(/\?\s([^?]+?)\s([^?]+?)\s([^?]+)\?/)) {
    const first = wd.match(/\?\s([^?]+?)\s([^?]+?)\s([^?]+)\?/)
    if (first) {
      wd = wd.replace(first[0], '')
    }
  }
}

// ***开始解析概率    %30 语句%
const probabilityJudgments = () => {
  while (wd.match(/%(.*?)\s(.*?)%/)) {
    const next1 = wd.match(/%(.*?)\s(.*?)%/)
    if (next1) {
      const num = random(0, 100)
      if (num < Number(next1[1])) {
        wd = wd.replace(next1[0], next1[2])
      } else {
        wd = wd.replace(next1[0], '')
      }
    }
  }
}

// 掉落物品
// 开始解析减少     -物品名 数量 目标/that-
const itemsToReduce = () => {
  while (wd.match(/\$清零\s([\s\S]+?)\$/)) {
    const load = wd.match(/\$清零\s([\s\S]+?)\$/)
    if (load) {
    fs.unlinkSync(path.join(dir, './word/userData', `${load[1]}.json`))
      wd = wd.replace(load[0], '')
    }
  }

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
          wd = wd.replace(third[0], '')
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
          if (num[1] === 'all') {
            outNumber = random(Number(num[0]), user[mData[0]])
          } else if (num[1] === '0.5all') {
            outNumber = random(Number(num[0]), user[mData[0]] / 2)
          } else if (num[1] === '0.2all') {
            outNumber = random(Number(num[0]), user[mData[0]] / 5)
          } else {
            outNumber = random(Number(num[0]), Number(num[1]))
          }
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
}
// ***开始解析添加    +物品名 数量 目标/that+
const itemsToAdd = () => {
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
            name,
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
}

// ***获取属性  #物品名 目标#
const lagQuery = () => {
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
          wd = wd.replace(end[0], data[name].join('\n'))
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
}

// ***将$换$变为
const newlineReplacement = () => {
  while (wd.match(/\$换\$/)) {
    if (wd.match(/\$换\$/)) {
      const over = wd.match(/\$换\$/)
      if (over) {
        wd = wd.replace(over[0], '\n')
      }
    }
  }
}

// 导出解析者
export default class pars {
  constructor (a:string, b:string, c:any, d:string, e:any, f:any, g:string, h:string) {
    wd = a
    tha = b
    dir = c
    uid = d
    things = e
    thingnum = f
    userName = g
    q = h
  }

  // 开始解析
  start () {
    givePriorityToQuery()
    suspendJudgment()
    suspendJudgmentInSilence()
    administratorDetermine()
    numberOf()
    probabilityJudgments()
    itemsToReduce()
    itemsToAdd()
    lagQuery()
    newlineReplacement()
    time()

    return wd
  }
}
