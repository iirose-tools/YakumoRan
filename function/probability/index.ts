import fs from 'fs'
import path from 'path'
import * as api from '../../lib/api'
import config from '../../config'
import logger from '../../lib/logger'
import random from 'random-number-csprng'
// import { report } from 'process'

try {
  fs.mkdirSync(path.join(__dirname, '../../data/probability'))
} catch (error) {}

const limit: any = {}

const getLimit = (uid: string, tim: number) => {
  if (limit[uid]) return false

  limit[uid] = true
  setTimeout(() => {
    delete limit[uid]
  }, tim)
  return true
}

// 获取玩家的金币
const getMoney = (uid: string) => {
  const moneyPath = path.join(__dirname, `../../data/probability/${uid}.json`)
  if (!fs.existsSync(moneyPath)) {
    fs.writeFileSync(moneyPath, '{"money":100,"probab":50}')
  }
  return JSON.parse(fs.readFileSync(moneyPath).toString())
}

// 更新json文件
const update = (uid: string, file:any) => {
  try {
    fs.writeFileSync(path.join(__dirname, `../../data/probability/${uid}.json`), JSON.stringify(file, null, 3))
    logger('probability').info('文件写入成功')
  } catch (error) {
    logger('probability').warn('文件写入失败', error)
  }
}

// 核心源码
// eslint-disable-next-line no-useless-escape
api.command(new RegExp(`^${config.app.nickname}压(.*)$`), async (m, e, reply) => {
  if (!getLimit(e.uid, config.function.probab.every)) return

  const nowMoney = getMoney(e.uid)
  if (nowMoney.probab <= 0 || nowMoney.probab >= 100) {
    nowMoney.probab = 50
  }
  const m1 = m[1] === '完' ? nowMoney.money : Number(m[1].trim())

  if (isNaN(m1)) return reply('你输入的似乎不是数字哦~换成数字再试一下吧', config.app.color)
  if (m1 <= 0) return reply('下注金额必须大于0', config.app.color)
  if (m1 > nowMoney.money) return reply('下注金额必须小于您当前余额哦~', config.app.color)
  if (m1 <= Math.max() || m1 >= Math.min()) return reply('请输入一个正常的数字', config.app.color)
  if (nowMoney.money >= m1) {
    if (await random(0, 100) >= nowMoney.probab) {
      nowMoney.money = nowMoney.money - m1
      if (nowMoney.money === 0) {
        if (getLimit(e.uid, config.function.probab.huifu)) {
          nowMoney.probab = nowMoney.probab + 10
          nowMoney.money = 100
          update(e.uid, nowMoney)
          reply(` [*${e.username}*]   :  已经把您的余额恢复为了 100 钞 , 下次恢复还有20秒！祝您游玩愉快~ `, config.app.color)
        }
        if (!getLimit(e.uid, config.function.probab.huifu)) {
          update(e.uid, nowMoney)
        }
      } else {
        nowMoney.probab = nowMoney.probab + 10
        update(e.uid, nowMoney)
        reply(` [*${e.username}*]   :  余额 - ${m1} 钞   ❌   ,   💰 ${String(nowMoney.money)} 钞`, config.app.color)
      }
    } else {
      nowMoney.probab = nowMoney.probab - 10
      nowMoney.money = nowMoney.money + m1
      update(e.uid, nowMoney)
      reply(` [*${e.username}*]   :  余额 + ${m1} 钞   ✔️   ,   💰 ${String(nowMoney.money)} 钞`, config.app.color)
    }
  } else {
    reply(` [*${e.username}*]   :  抱歉  ,  您的余额不足  ,  您的当前余额为  :  ${String(nowMoney.money)} 钞`, config.app.color)
  }
})

// 查看钱包
api.command(/^查看钱包$/, async function (m, e, reply) {
  const nowMoney = getMoney(e.uid)
  reply(` [*${e.username}*]   :  您的余额为  :  ${String(nowMoney.money)}钞`, config.app.color)
})

// 钱包重启计划
api.command(/^重启钱包$/, async function (m, e, reply) {
  const nowMoney = getMoney(e.uid)
  if (!getLimit(e.uid, 10000)) {
    return null
  } else {
    nowMoney.money = 100
    nowMoney.probab = 50
    update(e.uid, nowMoney)
    reply(` [*${e.username}*]   :  唔~ 请加油哦~ 这是阁下的新钱包~ 祝您能够玩得愉快~!  :  ${String(nowMoney.money)}钞`, config.app.color)
  }
})

// 设置积分
api.command(/^设置(.*):(.*)$/, async function (m, e, reply) {
  const m1 = Number(m[2].trim())
  if (m1 <= Math.max() || m1 >= Math.min()) return reply('请输入一个正常的数字', config.app.color)
  const nowMoney = getMoney(e.uid)
  if (e.username !== config.app.master) {
    reply(` [*${e.username}*]   :  ${config.app.nickname}做不到啦...去叫叫咱的主人来试试..(?`, config.app.color)
    return null
  }

  const theUid = m[1].replace(/[@[\] ]/g, '').trim()
  nowMoney.money = m1
  update(theUid, m1)
  reply(` [*${e.username}*]   :  您的余额为  :  ${String(nowMoney.money)}钞`, config.app.color)
})
