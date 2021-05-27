import * as Ran from '../../lib/api'
import config from '../../config'
import { EventEmitter } from 'events'
import logger from '../../lib/logger'

interface Session {
  score: number,
  logs: number[],
  index: number
}

const choice = new EventEmitter()

const question: string[] = [
  '我感到沮丧，郁闷',
  '我感到早上心情最好',
  '我要哭或想哭',
  '我夜间睡眠不好',
  '我吃饭像平时一样多',
  '我的性功能正常',
  '我感到体重减轻',
  '我为便秘烦恼',
  '我的心跳比平时快',
  '我无故感到疲劳',
  '我的头脑像往常一样清楚',
  '我做事情像平时一样不感到困难',
  '我坐卧不安,难以保持平静',
  '我对未来感到有希望',
  '我比平时更容易激怒',
  '我觉得决定什么事很容易',
  '我感觉自己是有用和不可缺少的人',
  '我的生活很有意义',
  '假若我死了别人会过的更好',
  '我仍旧喜爱自己平时喜爱的东西'
]

const session: {
  [index: string]: Session
} = {}

const SDS = {
  init: (uid: string) => {
    logger('SDS').info(uid, '初始化了测试')

    if (session[uid]) {
      delete session[uid]
      choice.emit(uid, 'close')
    }

    session[uid] = {
      index: 0,
      score: 0,
      logs: []
    }

    Ran.method.sendPrivateMessage(uid, [
      '本测试总共20道选择题，测试结果不完全代表您的实际情况，若需要专业检查请去医院进行',
      'SAS采用4级评分，主要评定症状出现的频度，其标如下',
      'A: 完全没有或很少时间有',
      'B: 有时候有',
      'C: 大部分时间有',
      'D: 绝大部分时间或者全部时间有',
      '',
      '阅读完成后，回复 “开始” 正式开始测试'
    ].join('\n'), config.app.color)
  },
  makeReq: (index: number) => {
    return [
      `${index + 1}. ${question[index]}`,
      '',
      'A: 完全没有或很少时间有',
      'B: 有时候有',
      'C: 大部分时间有',
      'D: 绝大部分时间或者全部时间有'
    ].join('\n')
  },
  start: (uid: string) => {
    if (session[uid] && session[uid].index === 0) {
      SDS.next(uid)
      logger('SDS').info(uid, '开始了测试')
    }
  },
  result: (uid: string) => {
    const raw = session[uid].score // 原始分
    const T = parseInt(String(session[uid].score * 1.25)) // 标准T分

    let result = '无明显抑郁状态'

    if (T > 72) result = '重度抑郁'
    if (T > 63 && T <= 72) result = '中度抑郁'
    if (T >= 53 && T <= 62) result = '轻度抑郁'

    const append = T > 53 ? ['', '我们要热爱生活，不要追问。生命有许多美好的事情~', '请允许他人爱你呀~ 相信这份爱~ 为他们活下去，即使你觉得毫无意义~'] : []

    logger('SDS').info(uid, '结束了测试')

    Ran.method.sendPrivateMessage(uid, [
      '以下是您的测试结果',
      `原始分：${raw}`,
      `标准T分：${T}`,
      `测试结果: ${result}`,
      ...append
    ].join('\n'), config.app.color)
  },
  next: (uid: string) => {
    const re = [1, 4, 5, 10, 11, 13, 15, 16, 17, 19]

    const q = SDS.makeReq(session[uid].index)

    choice.once(uid, (c: string) => {
      if (c === 'close') return

      const scoreMap: {
        [index: string]: number
      } = {
        A: 1,
        B: 2,
        C: 3,
        D: 4
      }

      let score = scoreMap[c]

      if (re.includes(session[uid].index)) score = 5 - score

      session[uid].logs.push(score)

      session[uid].score += score

      if (session[uid].index === 19) {
        SDS.result(uid)
        return
      }

      setTimeout(() => {
        session[uid].index++
        SDS.next(uid)
      }, 1e3)
    })

    Ran.method.sendPrivateMessage(uid, q, config.app.color)
  }
}

Ran.Event.on('PrivateMessage', e => {
  const c = ['A', 'B', 'C', 'D']
  if (c.includes(e.message.trim().toUpperCase())) {
    choice.emit(e.uid, e.message.toUpperCase())
  }
})

Ran.Event.on('PrivateMessage', e => {
  const cmd = e.message.trim().toUpperCase()

  if (cmd === 'SDS') SDS.init(e.uid)
  if (cmd === '开始') SDS.start(e.uid)
})
