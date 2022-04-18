import fs from 'fs'
import path from 'path'

export default class word {
  where:any
  dir:any
  wordData:any
  userData:any
  nickname:string

  // 苏苏的随机数生成姬
  random = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n) }

  /**
  * 返回一个文件的json对象
  * @param list 词库文件目录（wordconfig/userData/wordData）
  * @param name 词库文件名
  * @return 词库json对象
  */
  getjson = (list:string, name:string) => {
    const wordPath = path.join(this.dir, `./word/${list}/${name}.json`)
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
  update = (list:string, name:string, file:any) => {
    try {
      fs.writeFileSync(path.join(this.dir, `./word/${list}/${name}.json`), JSON.stringify(file, null, 3))
    } catch (error) {
    }
  }

  /**
  * 获取词库json对象
  * @return 词库json对象
  */
  getword = () => {
    const fileName = path.join(this.dir, './word/wordData')
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

  /**
    * 初始化词库对象
    * @dir 指定词库存储根目录
    * @uid 机器人主人
    * @nick 机器人昵称
  */
  constructor (dir:string, uid:string, nick:string) {
    this.dir = dir
    try { fs.mkdirSync(path.join(dir, 'word')) } catch (err) { }
    try { fs.mkdirSync(path.join(dir, 'word/wordData')) } catch (err) { }
    try { fs.mkdirSync(path.join(dir, 'word/userData')) } catch (err) { }
    try { fs.mkdirSync(path.join(dir, 'word/wordconfig')) } catch (err) { }
    const adminlist = this.getjson('wordconfig', 'adminlist')
    if (!adminlist.admin) { // admin高级权限
      adminlist.admin = [uid]
    }
    this.update('wordconfig', 'adminlist', adminlist)
    this.nickname = nick
  }

  /**
    * 添加词库
    * @param q 指定触发词
    * @param a 指定触发后的回复
    * @param m 指定编辑者数据json：{uid:"id",name:"昵称"}
    * @return 返回为字符串，成功/失败
  */
  add (q:string, a:string, m:any) {
    // 获取json对象后判断key是否存在，不存在则定义为数组，若存在则为数组添加元素，并存储它
    const uid = m.uid
    let listName = ''
    const list = this.getjson('wordconfig', 'userlist')
    if (Object.prototype.hasOwnProperty.call(list, uid)) {
      listName = list[uid]
    } else {
      listName = '默认'
    }

    const word = this.getjson('wordData', listName)
    if (word[q] == null) {
      word[q] = []
    }
    if (word[q][a]) return (`  [ 词库核心 ]  该词条已存在于词库【${listName}】，序号为【${word[q].indexOf(a) + 1}】`)
    const num = word[q].push(a)
    this.update('wordData', listName, word)
    return (`  [ 词库核心 ]  添加成功，已添加到词库【${listName}】，序号为【${num}】`)
  }

  /**
    * 删除词库
    * @param q 指定触发词
    * @param num 指定第几条回复（若为'all'则删除整个词条）
    * @param m 指定编辑者数据json：{uid:"id",name:"昵称"}
    * @return 返回为字符串，成功/失败
  */
  del (q:string, num:string, m:any) {
    const id = m.uid
    // 获取json对象后，删除其中的一项，若删除后数组为空则删除key，存储数组
    const ku = this.getjson('wordconfig', 'userlist')
    let word
    let outList = ''
    if (ku[id]) {
      outList = ku[id]
      word = this.getjson('wordData', ku[id])
    } else {
      outList = '默认'
      word = this.getjson('wordData', '默认')
    }
    if (!word[q]) { return '  [ 词库核心 ]  并未在当前库中找到相应的关键词' }
    if (num === 'all') {
      delete word[q]
    } else {
      word[q].splice(Number(num) - 1, 1)
      if (!word[q].length) {
        delete word[q]
      }
    }

    this.update('wordData', outList, word)
    return (`  [ 词库核心 ]  删除成功，词库【${outList}】，处理成功`)
  }

  /**
    * 获取触发词的位置
    * @param q 被寻找的触发词
    * @return 返回为搜索结果（字符串）
  */
  getas (q:string) {
    try {
      const fileName = path.join(this.dir, './word/wordData')
      const list = fs.readdirSync(fileName)
      const qList:any = []
      list.forEach(function (item, index) {
        const word = JSON.parse(fs.readFileSync(path.join(fileName + `/${item}`)).toString())
        if (word[q]) {
          const name = item.match(/(.*).json/)
          if (name) {
            qList.push(name[1])
          }
        }
      })
      return (`  [ 词库核心 ]  相关询问存储于【${qList.join('  ,  ')}】词库中`)
    } catch (err) {
      return '  [词库核心]  啊哦...好像产生了未知错误....快告诉开发者...!'
    }
  }

  /**
    * 获取回复词的位置
    * @param a 被寻找的回复词
    * @return 返回为搜索结果（字符串）
  */
  getqs (a:string) {
    try {
      const fileName = path.join(this.dir, './word/wordData')
      const list = fs.readdirSync(fileName)
      const aDataList:any = []
      list.forEach(function (item, index) {
        const word = JSON.parse(fs.readFileSync(path.join(fileName + `/${item}`)).toString())
        const name = item.match(/(.*).json/)
        if (name) {
          for (let i = 0; i < Object.keys(word).length; i++) {
            if (word[Object.keys(word)[i]].indexOf(a) >= 0) {
              aDataList.push(`词库【${name[1]}】  ：  问【${Object.keys(word)[i]}】  序号：【${word[Object.keys(word)[i]].indexOf(a) + 1}】`)
            }
          }
        }
      })
      return (`  [ 词库核心 ]  相关询问存储于\n ${aDataList.join('\n')}`)
    } catch (err) {
      return '  [词库核心]  啊哦...好像产生了未知错误....快告诉开发者...!'
    }
  }

  /**
    * 获取问的表
    * @param q 显示的库
    * @param m 查询者数据json：{uid:"id",name:"昵称"}
    * @return 返回为搜索结果（字符串）
  */
  alist (q:string, m:any) {
    const ku = this.getjson('wordconfig', 'userlist')
    let word
    let outList = ''
    if (ku[m.uid]) {
      outList = ku[m.uid]
      word = this.getjson('wordData', ku[m.uid])
    } else {
      outList = '默认'
      word = this.getjson('wordData', '默认')
    }

    if (word[q]) {
      let out = ''
      word[q].forEach(function (item:any, index:any) {
        out = out + `\n${index + 1}.   ` + item
      })
      return ` [词库核心]  查询到以下回答：\n\n\n ${out}`
    } else {
      return `  [ 词库核心 ]  库【 ${outList} 】 无法查询到此回答，请确定该词条存在或进入其他库查询`
    }
  }

  /**
    * 词库解析
    * @param rawq 需要回复的触发词
    * @param m 触发者的数据json:{uid:'id',name:'昵称'}
    * @return 返回为回复结果
  */
  start (rawq:string, m:any) {
    const uid:string = m.uid
    const userName:string = m.username
    // 将唯一标识转换为id
    let wd = ''
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

    // 获取全部的词库
    if (this.getword()[rawq]) {
      const num = this.random(0, this.getword()[rawq].length - 1)
      wd = this.getword()[rawq][num]
      console.log(`  【 词库核心 】  已触发词库   【${rawq}】 `)
    } else if (this.getword()[q]) {
      const num = this.random(0, this.getword()[q].length - 1)
      wd = this.getword()[q][num]
      console.log(`  【 词库核心 】  已触发词库   【${q}】 `)
    } else {
      return null
    }

    try {
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
          const data = this.getjson('userData', mubiao)
          if (endData[0].substring(0, 2) === '武器' || endData[0].substring(0, 2) === '防具') {
            if (endData[0].substring(2, 3)) {
              if (endData[0].substring(2, 3) === '名') { wd = wd.replace(end[0], data[endData[0].substring(0, 2)].name) }
              if (endData[0].substring(2, 3) === '值') { wd = wd.replace(end[0], data[endData[0].substring(0, 2)].value) }
            }
          } else if (endData[0].substring(0, 3) === 'str') {
            const name = endData[0].replace('str', '')
            if (!data[name]) { data[name] = [] }
            wd = wd.replace(end[0], data[name].join('，'))
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
          const nowlist = this.getjson('wordconfig', 'timelist')
          if (!nowlist[uid]) { nowlist[uid] = {} }
          if (!nowlist[uid][load[2]]) {
            nowlist[uid][load[2]] = Number(now + Number(load[1]))
            wd = wd.replace(load[0], load[2])
          } else {
            if (nowlist[uid][load[2]] > now) {
              return `  【 词库核心: ${userName} 】  ${q} 任务未完成...`
            } else {
              nowlist[uid][load[2]] = Number(now + Number(load[1]))
              wd = wd.replace(load[0], load[2])
            }
          }
          this.update('wordconfig', 'timelist', nowlist)
        }
      }

      // 判断管理员命令
      while (wd.match(/{(.*?)}/)) {
        if (wd.match(/{(.*?)}/)) {
          const over = wd.match(/{(.*?)}/)
          try {
            if (over) {
              const admin = this.getjson('wordconfig', 'adminlist')
              if (admin.admin.indexOf(uid) >= 0) {
                wd = wd.replace(over[0], over[1])
              } else {
                wd = wd.replace(over[0], '')
              }
            }
          } catch (err) {
            return `  【 词库核心 】  [${q}]   无法获取对应数据`
          }
        }
      }

      // 将$@$变为
      while (wd.match(/\$@\$/)) {
        if (wd.match(/\$@\$/)) {
          const over = wd.match(/\$@\$/)
          try {
            if (over) {
              wd = wd.replace(over[0], name)
            }
          } catch (err) {
            return `  【 词库核心 】  [${q}]   无法获取对应数据`
          }
        }
      }

      // 将$称$变为机器人昵称
      while (wd.match(/\$称\$/)) {
        if (wd.match(/\$称\$/)) {
          const over = wd.match(/\$称\$/)
          try {
            if (over) {
              wd = wd.replace(over[0], this.nickname)
            }
          } catch (err) {
            return `  【 词库核心 】  [${q}]   无法获取对应数据`
          }
        }
      }

      // 开始解析判断    ?物品名<>=<>数量 语句?
      while (wd.match(/\?(.*?)\s(.*?)\s(.*?)\s(.*?)\?/)) {
        const first = wd.match(/\?(.*?)\s(.*?)\s(.*?)\s(.*?)\?/)
        if (first) {
          const mData = this.getjson('userData', uid)
          let out = ''
          if (first[2] === '<' && mData[first[1]] < Number(first[3])) { out = first[4] }
          if (first[2] === '>' && mData[first[1]] > Number(first[3])) { out = first[4] }
          if (first[2] === '=' && mData[first[1]] === Number(first[3])) { out = first[4] }
          if (first[2] === '<>' && mData[first[1]] !== Number(first[3])) { out = first[4] }
          wd = wd.replace(first[0], out)
        }
      }

      // 开始解析概率    %30 语句%
      while (wd.match(/%(.*?)\s(.*?)%/)) {
        const next1 = wd.match(/%(.*?)\s(.*?)%/)
        if (next1) {
          const num = this.random(0, 100)
          if (num < Number(next1[1])) {
            wd = wd.replace(next1[0], next1[2])
          } else {
            wd = wd.replace(next1[0], '什么都木有')
          }
        }
      }

      // 收集本次干了啥，失败则恢复
      const things:any = {}
      let thingnum = 0
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
          const user = this.getjson('userData', mubiao)
          if (mData[0].substring(0, 2) === '武器' || mData[0].substring(0, 2) === '防具') {
            if (!user[mData[0].substring(0, 2)]) { user[mData[0].substring(0, 2)] = { name: '', value: 0 } }
            const name = user[mData[0].substring(0, 2)].name
            thingnum++
            things[String(thingnum)] = [mubiao, mData[0].substring(0, 2), user[mData[0].substring(0, 2)], 'other1']
            if (mData[1].search('~') >= 0) {
              const num = mData[1].split('~')
              outNumber = this.random(Number(num[0]), Number(num[1]))
            } else {
              outNumber = (mData[1] === 'all') ? (user[mData[0].substring(0, 2)].name) : (Number(mData[1]))
            }
            user[mData[0].substring(0, 2)].value = user[mData[0].substring(0, 2)].value - outNumber
            if (!user[mData[0].substring(0, 2)].value || user[mData[0].substring(0, 2)].value <= 0) { delete user[mData[0].substring(0, 2)] }
            this.update('userData', mubiao, user)
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
              this.losserr(things)
              return `  [ 词库核心 ]  【${userName}】  似乎失败了...唔..好像没有物品【${name}】`
            }
            this.update('userData', mubiao, user)
          } else {
            if (!user[mData[0]]) { user[mData[0]] = 0 }
            if (mData[1].search('~') >= 0) {
              const num = mData[1].split('~')
              outNumber = this.random(Number(num[0]), Number(num[1]))
            } else {
              outNumber = (mData[1] === 'all') ? (user[mData[0]]) : (Number(mData[1]))
            }
            user[mData[0]] = (user[mData[0]] * 1000 - outNumber * 1000) / 1000
            if (user[mData[0]] < 0) {
              this.losserr(things)
              return `  [ 词库核心 ]  【${userName}】  似乎失败了...唔..好像物品【${mData[0]}】不够`
            }
            thingnum++
            things[String(thingnum)] = [mubiao, mData[0], outNumber, '-']
            this.update('userData', mubiao, user)
            wd = wd.replace(third[0], String(outNumber))
          }
        }
      }

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
          const user = this.getjson('userData', mubiao)
          if (mData[0].substring(0, 2) === '武器' || mData[0].substring(0, 2) === '防具') {
            if (!user[mData[0].substring(0, 2)]) { user[mData[0].substring(0, 2)] = { name: '', value: 0 } }
            const name = mData[0].replace(mData[0].substring(0, 2), '')
            thingnum++
            things[String(thingnum)] = [mubiao, [mData[0].substring(0, 2), name], user[mData[0].substring(0, 2)], 'other1']
            const outnum = Number((mData[1].search('~') >= 0) ? (this.random(Number(mData[1].split('~')[0]), Number(mData[1].split('~')[1]))) : Number(mData[1]))
            if (outnum > user[mData[0].substring(0, 2)].value) {
              user[mData[0].substring(0, 2)] = {
                name: name,
                value: outnum
              }
              this.update('userData', mubiao, user)
              wd = wd.replace(second[0], `${name}，强度${outnum}`)
            } else {
              return '  [词库核心]  当前背包内的武器可能更好哦~新装备已被丢弃'
            }
          } else if (mData[0].substring(0, 3) === 'str') {
            const name = mData[0].replace('str', '')
            if (!user[name]) { user[name] = [] }
            thingnum++
            things[String(thingnum)] = [mubiao, name, user[name], 'other2']
            if (user[name].indexOf(mData[1]) === -1) {
              user[name].push(String(mData[1]))
            }
            this.update('userData', mubiao, user)
            wd = wd.replace(second[0], String(mData[1]))
          } else {
            if (!user[mData[0]]) { user[mData[0]] = 0 }
            let outNumber = 0
            if (mData[1] === 'all') {
              outNumber = user[mData[0]]
            } else {
              outNumber = (mData[1].search('~') >= 0) ? (this.random(Number(mData[1].split('~')[0]), Number(mData[1].split('~')[1]))) : Number(mData[1])
            }
            user[mData[0]] = (outNumber * 1000 + user[mData[0]] * 1000) / 1000
            this.update('userData', mubiao, user)
            thingnum++
            things[String(thingnum)] = [mubiao, mData[0], outNumber, '+']
            wd = wd.replace(second[0], String(outNumber))
          }
        }
      }

      // 将$发$变为机器人昵称
      while (wd.match(/\$发\$/)) {
        if (wd.match(/\$发\$/)) {
          const over = wd.match(/\$发\$/)
          if (over) {
            wd = wd.replace(over[0], userName)
          }
        }
      }

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
          const data = this.getjson('userData', mubiao)
          if (endData[0].substring(0, 2) === '武器' || endData[0].substring(0, 2) === '防具') {
            if (endData[0].substring(2, 3)) {
              if (endData[0].substring(2, 3) === '名') { wd = wd.replace(end[0], data[endData[0].substring(0, 2)].name) }
              if (endData[0].substring(2, 3) === '值') { wd = wd.replace(end[0], data[endData[0].substring(0, 2)].value) }
            }
          } else if (endData[0].substring(0, 3) === 'str') {
            const name = endData[0].replace('str', '')
            if (!data[name]) { data[name] = [] }
            wd = wd.replace(end[0], data[name].join('，'))
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
    } catch (err) {
      return `  [词库核心]    问：【${q}】词条【${wd}】    \n\n发生致命解析错误，请查看当前解析词条中符号是否为英文，若无法解决请联系开发者`
    }
    if (wd) {
      return wd
    }
  }

  /**
    * 选择编辑词库
    * @param db 设置被编辑词库
    * @param m 设置人数据json：{uid:"id",name:"昵称"}
    * @return 返回为回复结果（成功/失败）
  */
  in (db:string, m:any) {
    const uid = m.uid
    const list = this.getjson('wordconfig', 'userlist')
    list[uid] = db
    this.update('wordconfig', 'userlist', list)
    return ` [词库核心] 设置成功，接下来您添加的词库将添加至【${db}】词库`
  }

  /**
    * 恢复编辑默认词库
    * @param m 设置人数据json：{uid:"id",name:"昵称"}
    * @return 返回为回复结果（成功/失败）
  */
  out (m:any) {
    const uid = m.uid
    const list = this.getjson('wordconfig', 'userlist')
    try {
      delete list[uid]
      this.update('wordconfig', 'userlist', list)
      return ' [词库核心] 设置成功，将添加至【默认】词库'
    } catch (err) { return ' [词库核心] 设置失败' }
  }

  /**
    * 获取库的表
    * @return 返回为搜索结果（字符串）
  */
  list () {
    const fileName = path.join(this.dir, './word/wordData')
    const list = fs.readdirSync(fileName)
    const kulist:any = []
    list.forEach(function (item, index) {
      const name = item.match(/(.*).json/)
      if (name) {
        kulist.push(name[1])
      }
    }
    )
    return ` [词库核心] 当前拥有这些库：【${kulist.join(' ， ')}】`
  }

  /**
    * 获取库内的问表
    * @name 库名（字符串）
    * @return 返回为搜索结果（字符串）
  */
  qlist (name:string) {
    const word = this.getjson('wordData', name)
    const outlist = []
    for (let i = 0; i < Object.keys(word).length; i++) {
      outlist.push(`${i + 1}.       ${Object.keys(word)[i]}`)
    }
    return ` [词库核心] 搜索到的库内含有以下的触发词 ： \n\n ${outlist.join('\n')}`
  }

  // 反馈减少的错误
  losserr = (things:any) => {
    for (let n = Object.keys(things).length; n > 0; n--) {
      const json = things[n]
      const data = this.getjson('userData', json[0])
      if (json[3] === '-') { data[json[1]] = data[json[1]] + json[2] }
      if (json[3] === '+') { data[json[1]] = data[json[1]] - json[2] }
      if (json[3] === 'other1') { data[json[1]] = json[2] }
      if (json[3] === 'other2') { data[json[1]] = json[2] }
      this.update('userData', json[0], data)
    }
  }

  /**
    * 增加词库管理员
    * @name 唯一标识（字符串）
    * @return 返回为结果（字符串）
  */
  op (name:string) {
    let id = ''
    const a = name.match(/\s*\[@(.*?)@\]\s*/)
    if (a) {
      id = a[1]
    }
    const adminlist = this.getjson('wordconfig', 'adminlist')
    if (adminlist.admin.indexOf(id) < 0) {
      adminlist.admin.push(id)
    }
    this.update('wordconfig', 'adminlist', adminlist)
    return ' [词库核心] 词库管理员设置成功...!'
  }

  /**
    * 去除词库管理员
    * @name 唯一标识（字符串）
    * @return 返回为结果（字符串）
  */
  deop (name:string) {
    let id = ''
    const a = name.match(/\s*\[@(.*?)@\]\s*/)
    if (a) {
      id = a[1]
    }
    const adminlist = this.getjson('wordconfig', 'adminlist')
    if (adminlist.admin.indexOf(id) >= 0) {
      adminlist.admin.splice(adminlist.admin.indexOf(id), 1)
    }
    this.update('wordconfig', 'adminlist', adminlist)
    return ' [词库核心] 词库管理员取消成功...!'
  }

  /**
    * 查询排行榜
    * @itemName 查询的物品（字符串），切记只能查询物品，不能查询文字
    * @return 返回为结果（字符串）
  */
  leaderboard (itemName:string) {
    try {
      const pathName = path.join(this.dir, './word/userData')
      const list = fs.readdirSync(pathName)
      const dataList:any = {}
      list.forEach(function (item, index) {
        const word = JSON.parse(fs.readFileSync(path.join(pathName + `/${item}`)).toString())
        const str = item.match(/(.*).json/)
        if (str) {
          if (word[itemName]) {
            dataList[`${word[itemName]}`] = str[1]
          }
        }
      })
      const test = Object.keys(dataList).map(function (item:any) {
        return Number(item)
      })
      test.sort(function (a:number, b:number) { return b - a })
      let out = ''
      let num = 0
      test.forEach(function (item, index) {
        num++
        out = out + `\n${num} : 【${dataList[test[num - 1]]}】 - ${test[num - 1]}`
      })
      return (`  [ 词库核心 ]  相关询问存储于\n ${out}`)
    } catch (err) {
      return '  [词库核心]  啊哦...好像产生了未知错误....快告诉开发者...!'
    }
  }
}
