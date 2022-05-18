import fs from 'fs'
import path from 'path'
import Pars from './pars'

// 苏苏的随机数生成姬
const random = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n) }

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

      // 初始化解析对象
      const pars = new Pars(wd, tha, dir, uid, things, thingnum, userName, q)

      // 输出常规替换与判断
      wd = pars.start()

      // 导入wd, tha, dir, uid, things, thingnum, userName, q
      // 将不需要解析的值放出
      if (forbiddenPars.length) {
        forbiddenPars.forEach(function (item:string, index:number) {
          wd = wd.replace(`[${index}]`, item)
        })
      }
    } catch (err:any) {
      return err.message
    }

    console.log(wd)

    if (wd) {
      return wd
    } else {
      return null
    }
  }
}
