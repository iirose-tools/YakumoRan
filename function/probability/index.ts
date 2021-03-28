import fs from 'fs'
import path from 'path'
import * as api from '../../lib/api'
import config from '../../config'
import logger from '../../lib/logger'

try {
  fs.mkdirSync(path.join(__dirname, '../../data/probability'))
} catch (error) {}

// 苏苏的随机数生成姬
const random = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n) }

// 获取玩家的金币
const getMoney = (username: string) => {
  const wordPath = path.join(__dirname, `../../data/probability/${username}.json`)
  if (!fs.existsSync(wordPath)) {
    fs.writeFileSync(wordPath, '{"nowMoney": 350}')
  }

  return JSON.parse(fs.readFileSync(wordPath).toString())
}

// 更新json文件
const update = (file: any, tyf: string) => {
  try {
    fs.writeFileSync(path.join(__dirname, `../../data/probability/${tyf}.json`), JSON.stringify(file, null, 3))
    logger('Word').info('文件写入成功')
  } catch (error) {
    logger('Word').warn('文件写入失败', error)
  }
}

// 过滤[]*
const fitter = (txt: string) => {
  txt = txt.replace(/[\s[\]*]/g, '')
  return txt
}

// 核心源码
api.command(/^\.雨铭压(.*)$/, async (m, e, reply) => {
  const nowMoney = getMoney(e.username)
  const m1 = Number(m[1])
  if (isNaN(m1)) {
    reply('你输入的似乎不是数字哦~换成数字再试一下吧', config.app.color)
  } else if (nowMoney.nowMoney >= m1) {
    if (random(0, 1) === 0) {
      nowMoney.nowMoney = nowMoney.nowMoney - m1
      update(nowMoney, e.username)
      reply(` [*${e.username}*]   :  余额 - ${m1} 钞   ❌   ,   💰 ${String(nowMoney.nowMoney)} 钞`, config.app.color)
    } else {
      nowMoney.nowMoney = nowMoney.nowMoney + m1
      update(nowMoney, e.username)
      reply(` [*${e.username}*]   :  余额 + ${m1} 钞   ✔️   ,   💰 ${String(nowMoney.nowMoney)} 钞`, config.app.color)
    }
  } else {
    reply(` [*${e.username}*]   :  抱歉  ,  您的余额不足  ,  您的当前余额为  :  ${String(nowMoney.nowMoney)} 钞`, config.app.color)
  }
})

// 查看钱包
api.command(/^\.查看钱包(.*)$/, async (m, e, reply) => {
  const name: string = fitter(m[1])
  const nowMoney = getMoney(name)
  reply(` [*${e.username}*]   :  【${name}】 的余额为  :  ${String(nowMoney.nowMoney)}钞`, config.app.color)
})
