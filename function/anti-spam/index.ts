import * as api from '../../lib/api'
import logger from '../../lib/logger'

const globalCache: {
  [index: string]: {
    timestamp: number,
    list: string[],
    limit: number
  }
} = {}

const strCount = (str: string, target: string) => {
  const count = str.split(target).length - 1
  return count
}

// 是否为重复发言
const isDupe = (message: string) => {
  let maxCount = 0
  for (let index = 0; index < (message.length - 5); index++) {
    const str = message.substring(index, index + 5)
    const count = strCount(message, str)
    if (count > maxCount) maxCount = count
  }

  return maxCount
}

const compareTwoStrings = (first: string, second: string) => {
  const list = []
  for (const str of first.split('')) {
    list.push(second.includes(str) ? 1 : 0)
  }

  return list.reduce((prev, curr) => {
    return prev + curr
  }, 0) / list.length
}

// 计算不同发言之间的相似度
const messageCompare = (uid: string, msg: string) => {
  if (!globalCache[uid]) {
    globalCache[uid] = {
      timestamp: Date.now(),
      list: [],
      limit: 0
    }
  }

  globalCache[uid].timestamp = Date.now()
  globalCache[uid].list.push(msg)

  if (globalCache[uid].list.length > 5) globalCache[uid].list.shift()

  const list = []

  logger('messageCompare').debug(uid, globalCache[uid].list)

  for (const index1 in globalCache[uid].list) {
    const msg1 = globalCache[uid].list[index1]

    for (const index2 in globalCache[uid].list) {
      const msg2 = globalCache[uid].list[index2]

      if (index1 !== index2) {
        const result = compareTwoStrings(msg1, msg2)
        list.push(result)
      }
    }
  }

  const avg = list.reduce((prev, curr) => {
    return prev + curr
  }, 0) / list.length

  logger('messageCompare').debug(`${uid} > ${avg}`)

  return avg
}

const rateLimit = (uid: string) => {
  if (!globalCache[uid]) {
    globalCache[uid] = {
      timestamp: Date.now(),
      list: [],
      limit: 0
    }
  }

  globalCache[uid].limit++

  const _10s = 10 * 1e3
  const diff = Date.now() - globalCache[uid].timestamp
  if (diff <= _10s && globalCache[uid].limit > 5) return true

  globalCache[uid].timestamp = Date.now()
}

api.Event.on('PublicMessage', async event => {
  const dupeCounter = isDupe(event.message)
  const compare = messageCompare(event.uid, event.message)
  const rate = rateLimit(event.uid)
  let block = false

  if (dupeCounter > 10) block = true
  if (event.message.length > 200) block = true
  if (compare > 0.8) block = true
  if (rate) block = true

  if (block && !event.uid.startsWith('X')) {
    // 不是游客但是触发了规则的额外判断一下在线时长
    const user = await api.method.utils.getUserProfile(event.username)
    const reg = user.regTime.getTime()
    const now = Date.now()
    const diff = now - reg

    if (diff > 3600 * 24 * 1000) return
  }

  if (block) {
    api.method.admin.mute('all', event.username, '30d', '刷屏自动封禁')
    logger('Anti-SPAM').info(`用户 ${event.username} (${event.uid}) 触发了封禁规则，已禁言`)
  }
})
