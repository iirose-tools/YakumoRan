import fs from 'fs'
import path from 'path'
import * as api from '../../lib/api'
import config from '../../config'
import logger from '../../lib/logger'
import random from 'random-number-csprng'

try {
  fs.mkdirSync(path.join(__dirname, '../../data/probability'))
} catch (error) {}

const limit: any = {}

const getLimit = (uid: string) => {
  if (limit[uid]) return false

  limit[uid] = true
  setTimeout(() => {
    delete limit[uid]
  }, 5e3)

  return true
}

// 获取玩家的金币
const getMoney = (uid: string) => {
  const moneyPath = path.join(__dirname, `../../data/probability/${uid}.dat`)
  if (!fs.existsSync(moneyPath)) {
    fs.writeFileSync(moneyPath, '1000')
  }

  return JSON.parse(fs.readFileSync(moneyPath).toString())
}

// 更新json文件
const update = (uid: string, file: number) => {
  try {
    fs.writeFileSync(path.join(__dirname, `../../data/probability/${uid}.dat`), file.toString())
  } catch (error) {
    logger('probability').warn('文件写入失败', error)
  }
}

// 核心源码
// eslint-disable-next-line no-useless-escape
api.command(new RegExp(`^${config.app.nickname}压(.*)$`), async (m, e, reply) => {
  if (!getLimit(e.uid)) return

  let nowMoney = getMoney(e.uid)
  const m1 = m[1] === '完' ? nowMoney : Number(m[1].trim())

  if (isNaN(m1)) return reply('你输入的似乎不是数字哦~换成数字再试一下吧', config.app.color)
  if (m1 <= 0) return reply('下注金额必须大于0', config.app.color)
  if (m1 > nowMoney) return reply('下注金额必须小于您当前余额', config.app.color)
  if (m1 <= Math.max() || m1 >= Math.min()) return reply('请输入一个正常的数字', config.app.color)

  if (nowMoney >= m1) {
    if (await random(0, 100) >= 50) {
      nowMoney = nowMoney - m1
      update(e.uid, nowMoney)
      reply(` [*${e.username}*]   :  余额 - ${m1} 钞   ❌   ,   💰 ${String(nowMoney)} 钞`, config.app.color)
      if (nowMoney === 0) {
        reply(` [*${e.username}*]   :  已经把您的余额恢复为了 1000 钞`, config.app.color)
        update(e.uid, 1000)
      }
    } else {
      nowMoney = nowMoney + m1
      update(e.uid, nowMoney)
      reply(` [*${e.username}*]   :  余额 + ${m1} 钞   ✔️   ,   💰 ${String(nowMoney)} 钞`, config.app.color)
    }
  } else {
    reply(` [*${e.username}*]   :  抱歉  ,  您的余额不足  ,  您的当前余额为  :  ${String(nowMoney)} 钞`, config.app.color)
  }
})

// 查看钱包
api.command(/^查看钱包$/, async (m, e, reply) => {
  const nowMoney = getMoney(e.uid)
  reply(` [*${e.username}*]   :  您的余额为  :  ${String(nowMoney)}钞`, config.app.color)
})
