import * as api from '../../lib/api'
import per from '../permission/permission'

// 初始化配置信息
let config:any = {}
const usedata:any = {}
let now:string = ''
let round:number = 0
let group:any = { white: [], black: [] }
let list:any = { white: [], black: [] }
let alive = 0
let uidList:any = { mainUid: [], watchUid: [], white: [], black: [] }

// 苏苏的随机数生成姬
const random = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n) }

// 从数组中删除指定元素
const delElement = (arr:any, element: string) => {
  if (arr.indexOf(element)) {
    const num = arr.indexOf(element)
    arr.splice(num, 1)
  }
}

const duel = (a:any, b:any) => {
  let atkDamage = 0
  let dfsdamage = 0

  // 奇数兵加强
  if ((round % 2) === 1) {
    if (usedata[b].attack === 1) {
      dfsdamage = 7
    }
  }

  // 兵杀王
  if (usedata[b].attack === 6) {
    if (usedata[a].attack === 1) {
      atkDamage = 7
    }
  }

  // 骑士保王
  if (list[usedata[b].camp].indexOf('骑士') !== -1) {
    if (usedata[b].attack === 6) {
      dfsdamage = 8
    }
  }

  // 双方相同，则攻击力保持一致
  if (usedata[a].attack === usedata[b].attack) {
    atkDamage = 10
    dfsdamage = 10
  }
  // 返回最后演算结果
  return [atkDamage, dfsdamage]
}

// chess clear
api.command(/^chess restart$/, 'chess.restart', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'chess.op') && !per.users.hasPermission(e.uid, 'permission.chess')) return reply(` [ Chess ] ： [*${e.username}*] 您不是主持人`)
  config = { 白王: { type: 'white', identity: '王', firstlines: '三尺青锋弑了多少不归人', sercondLines: '作为决定胜负的棋子，保护好自己，不要轻易出动暴露自己，当然，不要忘了可以保护你的骑士', attack: '6' }, 白后: { type: 'white', identity: '后', firstLines: '带血的蔷薇便是最后的救赎吧', sercondLines: '理论上可以用来试探出对方的王，但请注意有时候的兵同样受保护，作为可以横扫棋局的棋子，尽好自己的责任', attack: '5' }, 白车: { type: 'white', identity: '车', firstLines: '和你一起把这乱局搅得翻天覆地', secondLines: '地位较高的棋子，可以与后打好配合，当然，也可以舍身去试探对方的棋子', attack: '4' }, 白象: { type: 'white', identity: '象', firstLines: '大梦终需醒，我倚剑笑苍天', sercondLines: '配角的位置，为何不能也大放光彩呢？', attack: '3' }, 白骑士: { type: 'white', identity: '骑士', firstLines: '君载着黑骏马，威风凛凛寻她', sercondLines: '作为最后一道防线，保护好你的王，还有，保护好自己，所以就少出动吧', attack: '2' }, 白兵: { type: 'white', identity: '兵', firstLines: '游走的狂徒，随时打出舍命一击', sercondLines: '价值堪比王，至于隐匿和伺机而动，就不必我多提示了吧', attack: '1' }, 黑王: { type: 'black', identity: '王', firstLines: '三尺青锋弑了多少不归人', sercondLines: '作为决定胜负的棋子，保护好自己，不要轻易出动暴露自己，当然，不要忘了可以保护你的骑士', attack: '6' }, 黑后: { type: 'black', identity: '后', firstLines: '带血的蔷薇便是最后的救赎吧', sercondLines: '理论上可以用来试探出对方的王，但请注意有时候的兵同样受保护，作为可以横扫棋局的棋子，尽好自己的责任', attack: '5' }, 黑车: { type: 'black', identity: '车', firstLines: '和你一起把这乱局搅得翻天覆地', sercondLines: '地位较高的棋子，可以与后打好配合，当然，也可以舍身去试探对方的棋子', attack: '4' }, 黑象: { type: 'black', identity: '象', firstLines: '大梦终需醒，我倚剑笑苍天', sercondLines: '配角的位置，为何不能也大放光彩呢？', attack: '3' }, 黑骑士: { type: 'black', identity: '骑士', firstLines: '君载着黑骏马，威风凛凛寻她', sercondLines: '作为最后一道防线，保护好你的王，还有，保护好自己，所以就少出动吧', attack: '2' }, 黑兵: { type: 'black', identity: '兵', firstLines: '游走的狂徒，随时打出舍命一击', sercondLines: '价值堪比王，至于隐匿和伺机而动，就不必我多提示了吧', attack: '1' } }
  config.havelist = ['白王', '白后', '白车', '白象', '白骑士', '白兵', '黑王', '黑后', '黑车', '黑象', '黑骑士', '黑兵']

  now = ''
  round = 0
  group = { white: [], black: [] }
  list = { white: [], black: [] }
  alive = 0
  uidList.mainUid.forEach(function (e:any) { // 清除主持人
    per.users.removePermission(e, 'chess.op')
  })
  uidList = { mainUid: [], watchUid: [], white: [], black: [] }
  reply(' [ Chess ] : 游戏初始化成功 ! ')
})

// 抽取身份
api.command(/^chess get$/, 'chess.get', async (m, e, reply) => {
  if (group.white.includes(e.username) || group.black.includes(e.username)) return reply(` [ Chess ] :  [*${e.username}*] 您已有身份`)
  try {
    const sequence = random(0, config.havelist.length - 1) // 生成一个随机数，范围在剩余人数-1与0之间
    const role = config.havelist[sequence] // 获取抽取的角色的名字

    delElement(config.havelist, role) // 删除已抽取的角色名
    usedata[e.username] = { camp: '', position: '', attack: 0, survive: 0 } // 告知默认的结构
    usedata[e.username].camp = config[role].type // 阵营
    usedata[e.username].position = config[role].identity // 兵种
    usedata[e.username].attack = config[role].attack // 攻击力

    let way:string
    if (config[role].type === 'white') {
      way = '白'
      group.white.push(e.username) // 白方名单列表增加
      list.white.push(config[role].identity) // 白方兵种列表增加
      uidList.white.push(e.uid)// 添加到白队的id表内
    } else {
      way = '黑'
      group.black.push(e.username) // 黑方名单列表增加
      list.black.push(config[role].identity) // 黑方兵种列表增加
      uidList.black.push(e.uid)// 添加到黑队的id表内
    }

    api.method.sendPublicMessage(` [Chess] ： [*${e.username}*] 已成功获得身份，您的阵营是：【${way}】`)
    api.method.sendPrivateMessage(e.uid, ` [ Chess ] ： [*${e.username}*] 已成功获得身份，您的身份是：【${role}】\n\n${config[role].firstLines}\n${config[role].sercondLines}`)
    api.method.sendPrivateMessage(e.uid, ' [ Chess ] ： 机器人私聊内发送信息可与队友一起讨论...!')
  } catch (error) {
    console.log(error)
    if (JSON.stringify(usedata) === '{}') {
      reply(' [ Chess ] ： 未初始化，请发送chess restart初始化游戏')
    } else {
      reply(' [ Chess ] ： 已无名额...请等待游戏结束')
    }
  }
})

// 攻击
api.command(/^attack\s\s\[\*(.*)\*]\s\s$/, 'chess.attack', async (m, e, reply) => {
  // 判断是否能够攻击
  if (usedata[m[1]].camp === usedata[e.username].camp) return reply(` [ Chess ] ：  [*${e.username}*] 您攻击的对象为自己阵营`)
  if (!usedata[m[1]]) return reply(` [ Chess ] ：  [*${e.username}*] 您攻击的对象不存在`)
  if (!usedata[e.username]) return reply(` [ Chess ] ：  [*${e.username}*] 您不是参赛者`)
  if (usedata[m[1]].survive === 1) return reply(` [ Chess ] ：  [*${e.username}*] 您攻击的对象已阵亡`)
  if (usedata[e.username].survive === 1) return reply(` [ Chess ] ：  [*${e.username}*] 您已阵亡`)
  if (now !== usedata[e.username].camp) return reply(` [ Chess ] ：  [*${e.username}*] 未到您的阵容攻击`)
  if (alive === 1) return reply(` [ Chess ] ：  [*${e.username}*] 本局游戏已经结束，请让裁判发送初始化指令：chess restart`)

  let results = []

  round = round + 1 // 回合数计算
  results = duel(e.username, m[1]) // 发送数据，坐等返回规则运算后的攻击力

  if (usedata[e.username].attack === 6) { reply(` [ Chess ] ： [*${e.username}*] 暴露了自己的身份：【王】`) }

  if (results[0] > results[1]) { // 如果攻击比防御大,则防御死
    delElement(list[usedata[m[1]].camp], m[1])
    delElement(group[usedata[m[1]].camp], m[1])
    reply(` [ Chess ] ： [*${e.username}*] 获得胜利!`)
    reply('游戏还未结束!请加油准备下一回合的战斗!')
  }
  if (results[0] < results[1]) { // 如果攻击比防御小,则攻击死
    delElement(list[usedata[e.username].camp], e.username)
    delElement(group[usedata[e.username].camp], e.username)
    reply(` [ Chess ] ： [*${m[1]}*] 获得胜利!`)
    reply('游戏还未结束!请加油准备下一回合的战斗!')
  }
  if (results[0] === results[1]) { // 如果攻击比防御一样大，则一起死
    delElement(list[usedata[m[1]].camp], m[1])
    delElement(group[usedata[m[1]].camp], m[1])
    delElement(list[usedata[e.username].camp], e.username)
    delElement(group[usedata[e.username].camp], e.username)
    reply(` [ Chess ] ： [*${e.username}*]  [*${m[1]}*] 均失败!`)
    reply('游戏还未结束!请加油准备下一回合的战斗!')
  }

  // 判断对局是否结束
  // 一方没有王
  if (list.white.indexOf('王') === -1) {
    alive = 1
    reply(' [ Chess ] ： 本局游戏已结束，【黑】阵营胜利')
  } else if (list.black.indexOf('王') === -1) {
    alive = 1
    reply(' [ Chess ] ： 本局游戏已结束，【白】阵营胜利')
  } else if (list.white.indexOf('王') === list.black.indexOf('王') && list.black.indexOf('王') === -1) {
    if (list.white.lenght === 0) {
      alive = 1
      reply(' [ Chess ] ： 本局游戏已结束，【黑】方阵营胜利')
    } else if (list.black.length === 0) {
      alive = 1
      reply(' [ Chess ] ： 本局游戏已结束，【白】方阵营胜利')
    } else if (list.black.length === list.white.lenght && list.white.lenght === 0) {
      alive = 1
      let out:string = ''
      if (usedata[e.username].camp === 'white') {
        out = '白'
      }
      if (usedata[e.username].camp === 'black') {
        out = '黑'
      }
      reply(` [ Chess ] ： 本局游戏已结束，【${out}】方阵营胜利`)
    }
  }
  now = ''
})

// 选择哪方攻击
api.command(/^请(白|黑)方攻击$/, 'chess.to', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'chess.op') && !per.users.hasPermission(e.uid, 'permission.chess')) return reply(` [ Chess ] ： [*${e.username}*] 您不是主持人`)
  if (m[1] === '白') {
    now = 'white'
    reply(' [ Chess ] ： 请【白】方准备攻击，在攻击之前，请先于机器人私聊处与队友讨论一下如何攻击吧!')
  }
  if (m[1] === '黑') {
    now = 'black'
    reply(' [ Chess ] ： 请【黑】方准备攻击，在攻击之前，请先于机器人私聊处与队友讨论一下如何攻击吧!')
  }
})

// 主持人获取权限
api.command(/^chess open$/, 'chess.open', async (m, e, reply) => {
  if (uidList.mainUid.includes(e.uid)) return
  per.users.addPermission(e.uid, 'chess.op')
  uidList.mainUid.push(e.uid)
  reply(` [ Chess ] ： [*${e.username}*]您已成为主持人，本局游戏开始!`)
})

// 私聊与队友交流
api.Event.on('PrivateMessage', event => {
  try {
    if (usedata[event.username].camp === 'white') {
      uidList.white.forEach(function (id:any) {
        if (id === event.uid) return
        api.method.sendPrivateMessage(id, ` [白方组内私聊]  [*${event.username}*]  >>  ${event.message} `)
      })
    } else if (usedata[event.username].camp === 'black') {
      uidList.black.forEach(function (id:any) {
        if (id === event.uid) return
        api.method.sendPrivateMessage(id, ` [黑方组内私聊]  [*${event.username}*]  >>  ${event.message} `)
      })
    } else if (uidList.watchUid.includes(event.uid)) {
      uidList.white.forEach(function (id:any) {
        api.method.sendPrivateMessage(id, ` [白方组内私聊]  [*${event.username}*]  >>  ${event.message} `)
      })
      uidList.black.forEach(function (id:any) {
        api.method.sendPrivateMessage(id, ` [黑方组内私聊]  [*${event.username}*]  >>  ${event.message} `)
      })
    } else if (uidList.mainUid.includes(event.uid)) {
      uidList.white.forEach(function (id:any) {
        api.method.sendPrivateMessage(id, ` [白方组内私聊]  [*${event.username}*]  >>  ${event.message} `)
      })
      uidList.black.forEach(function (id:any) {
        api.method.sendPrivateMessage(id, ` [黑方组内私聊]  [*${event.username}*]  >>  ${event.message} `)
      })
    }
  } catch (error) {

  }
})

// 查看本方阵营
api.command(/^chess list player$/, 'chess.list.player', async (m, e, reply) => {
  if (usedata[e.username].camp === 'white' || usedata[e.username].camp === 'black') {
    let msg = '【白方阵营】：'
    group[usedata[e.username].camp].forEach(function (e:any) {
      msg = msg + ` [*${e}*]\n`
    })
    reply(` [ Chess ] \n ${msg}`)
  }
})

// 查看本方棋子
api.command(/^chess list check$/, 'chess.list.check', async (m, e, reply) => {
  if (usedata[e.username].camp === 'white' || usedata[e.username].camp === 'black') {
    let msg = '【白方阵营】：'
    let i = -1
    group[usedata[e.username].camp].forEach(function (e:any) {
      i = i + 1
      msg = msg + ` [*${e}*]  >>  ${list[usedata[e.username].camp][i]}\n`
    })
    api.method.sendPrivateMessage(e.uid, ` [ Chess ] \n ${msg}`)
  }
})

// 查看双方在场人员
api.command(/^chess all player$/, 'chess.all.player', async (m, e, reply) => {
  let msg = ' [ Chess ] \n 【白方阵营】\n'

  group.white.forEach(function (whitename:any) {
    msg = msg + ` [*${whitename}*] \n`
  })

  msg = msg + '\n\n\n 【黑方阵营】\n'

  group.black.forEach(function (blackname:any) {
    msg = msg + ` [*${blackname}*] \n`
  })

  reply(msg)
})

// 查看双方在场棋子
api.command(/^chess all check$/, 'chess.all.check', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'chess.op') && !per.users.hasPermission(e.uid, 'permission.chess')) return reply(` [ Chess ] ： [*${e.username}*] 您不是主持人`)

  let i1 = -1
  let i2 = -1
  let msg = ' [ Chess ] \n 【白方阵营】\n'

  group.white.forEach(function (whitename:any) {
    i1 = i1 + 1
    msg = msg + ` [*${whitename}*]  >>  ${list.white[i1]}\n`
  })

  msg = msg + '\n\n\n 【黑方阵营】\n'

  group.black.forEach(function (blackname:any) {
    i2 = i2 + 1
    msg = msg + ` [*${blackname}*] ${list.black[i2]}\n`
  })

  api.method.sendPrivateMessage(e.uid, msg)
})

// 查看规则
api.command(/^chess help$/, 'chess.help', async (m, e, reply) => {
  api.method.sendPublicMessage('请查看私聊，帮助已送至')
  api.method.sendPrivateMessage(e.uid, '游戏流程：\n\n游戏开始时，游玩者发送check抽取身份，随后，将可以在主持人的引导下，攻击对方，当满足条件时则胜利\n\n\n攻击规则：\n王＞后＞车＞象＞骑士＞兵\n\n1.兵奇数回合受到保护\n2.兵＞王\n3.骑士存在时，王受到保护\n4.受保护者攻击时失去保护效果\n5.双王互换则直到双方其中一方没有棋子为止\n6.一方存在王，另一方没有时则存在的一方胜利\n7.当a到和你一样的兵种时，无视规则一起死亡\n8.当最后场上两方各只剩一个棋子时，且棋子相同，则率先攻击的获胜\n\n\n其他：\n观战者可以发送chess watch on来观战，发送chess watch off来禁用观战')
})

// 观战开
api.command(/^chess watch on$/, 'chess.watch.on', async (m, e, reply) => {
  if (uidList.watchUid.includes(e.uid)) return reply(` [ Chess ] ：  [*${e.username}*]   您已处于观战状态中...`)
  if (uidList.black.includes(e.uid)) return reply(` [ Chess ] ：  [*${e.username}*]   参赛者禁止修改观战状态！`)
  uidList.watchUid.push(e.uid)
  reply(` [ Chess ] ：  [*${e.username}*] 您已成功开始观战`)
})

// 观战关
api.command(/^chess watch off$/, 'chess.watch.off', async (m, e, reply) => {
  if (uidList.white.includes(e.uid)) return reply(` [ Chess ] ：  [*${e.username}*]   参赛者禁止修改观战状态！`)
  if (uidList.black.includes(e.uid)) return reply(` [ Chess ] ：  [*${e.username}*]   参赛者禁止修改观战状态！`)
  if (!uidList.watchUid.includes(e.uid)) return reply(` [ Chess ] ：  [*${e.username}*]   您未处于观战状态中...`)
  delElement(uidList.watchUid, e.uid)
  reply(` [ Chess ] ：  [*${e.username}*] 您已离开观战状态`)
})
