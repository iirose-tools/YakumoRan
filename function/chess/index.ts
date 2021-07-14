import fs from 'fs'
import path from 'path'
import * as api from '../../lib/api'
import per from '../permission/permission'

try {
  fs.mkdirSync(path.join(api.Data, './chess/user'))
  fs.mkdirSync(path.join(api.Data, './chess/config'))
  fs.mkdirSync(path.join(api.Data, './chess/list'))
} catch (error) {
}

// 苏苏的随机数生成姬
const random = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n) }

// 获取json
const getjson = (name:string, list:string) => {
  const wordPath = path.join(api.Data, `./chess/${name}/${list}.json`)
  if (!fs.existsSync(wordPath)) {
    fs.writeFileSync(wordPath, '{}')
  }
  return JSON.parse(fs.readFileSync(wordPath).toString())
}

// 更新json文件
const update = (list:any, tyf:string, file:string) => {
  try {
    fs.writeFileSync(path.join(api.Data, `./chess/${list}/${tyf}.json`), JSON.stringify(file, null, 3))
  } catch (error) {
  }
}

// 判断error
const isError = (element: any, index: any, array: any) => {
  return (element === null)
}

// 决斗
const duel = (attack:any, defense:any) => {
  const config = getjson('config', 'config')
  let defenseattack: number = defense.attack
  let attackattack: number = attack.attack
  if (config.time === 0) {
    switch (defense.attack) {
      case 1 : {
        defenseattack = 7
        break
      }
      case 6 : {
        const b = getjson('user', `${defense.way}group`)
        for (let i = 0; i < b.list.length; i++) {
          if (b.list[i] === '骑士') {
            defenseattack = 8
          }
        }
        break
      }
    }
    config.time = 1
  } else {
    switch (defense.attack) {
      case 6 : {
        const b = getjson('user', `${defense.way}group`)
        for (let i = 0; i < b.list.length; i++) {
          if (b.list[i] === '骑士') {
            defenseattack = 8
          }
        }
        break
      }
    }
    config.time = 0
  }
  if (attack.attack === defense.attack && attack.attack === 6) {
    attackattack = 6
    defenseattack = 6
  }
  if (attack.attack === defense.attack && attack.attack === 1) {
    attackattack = 1
    defenseattack = 1
  }
  if (attack.attack === 1 && defense.attack === 6) {
    attackattack = 7
  }
  const white = getjson('user', 'whitegroup')
  const black = getjson('user', 'blackgroup')
  const whitenum = white.list.length
  const blacknum = black.list.length
  if (whitenum === blacknum && whitenum === 1 && attack.attack === defense.attack) {
    attackattack = 10
    defenseattack = 0
  }
  update('config', 'config', config)
  return [attackattack, defenseattack]
}

// 删除阵亡数据
const killon = (identity:string, list:string) => {
  const group = getjson('user', `${list}group`)
  for (let i = 0; i < group.list.length; i++) {
    if (group.list[i] === identity) {
      group.list.splice(i, 1)
      group.user.splice(i, 1)
    }
  }
  update('user', `${list}group`, group)
}

const uidMap = new Map()

// 组内私聊
api.Event.on('PrivateMessage', event => {
  const groupconfig = getjson('config', 'config')

  const white: string[] = groupconfig.white
  const black: string[] = groupconfig.black

  if (!white || !black) return

  if (white.includes(` [*${event.username}*] `)) {
    const admin = per.users.has('chess.op')
    const watch = per.users.has('chess.watch')

    white.forEach(username => {
      const uid = uidMap.get(username)
      if (uid === event.uid) return
      api.method.sendPrivateMessage(uid, `[组内私聊] ${event.username} >> ${event.message}`, event.color)
    })

    watch.forEach(uid => {
      api.method.sendPrivateMessage(String(uid).toLowerCase(), `[白方组内私聊] ${event.username} >> ${event.message}`, 'fff')
    })

    admin.forEach(uid => {
      api.method.sendPrivateMessage(String(uid).toLowerCase(), `[白方组内私聊] ${event.username} >> ${event.message}`, 'fff')
    })
  }

  if (black.includes(` [*${event.username}*] `)) {
    const admin = per.users.has('chess.op')
    const watch = per.users.has('chess.watch')

    black.forEach(username => {
      const uid = uidMap.get(username)
      if (uid === event.uid) return
      api.method.sendPrivateMessage(uid, `[组内私聊] ${event.username} >> ${event.message}`, event.color)
    })

    watch.forEach(uid => {
      api.method.sendPrivateMessage(String(uid).toLowerCase(), `[黑方组内私聊] ${event.username} >> ${event.message}`, '000')
    })

    admin.forEach(uid => {
      api.method.sendPrivateMessage(String(uid).toLowerCase(), `[黑方组内私聊] ${event.username} >> ${event.message}`, '000')
    })
  }
})

// 抽取角色
api.command(/^chess open$/, 'chess.reset', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'chess.op') && !per.users.hasPermission(e.uid, 'permission.chess')) return reply(' [chess] : 您不是主持人', '66ccff')
  const theconfig = getjson('config', 'config')
  theconfig.王 = ['王', '三尺青锋弑了多少不归人', '作为决定胜负的棋子，保护好自己，不要轻易出动暴露自己，当然，不要忘了可以保护你的骑士', 6]
  theconfig.后 = ['后', '带血的蔷薇便是最后的救赎吧', '理论上可以用来试探出对方的王，但请注意有时候的兵同样受保护，作为可以横扫棋局的棋子，尽好自己的责任', 5]
  theconfig.车 = ['车', '和你一起把这乱局搅得翻天覆地', '地位较高的棋子，可以与后打好配合，当然，也可以舍身去试探对方的棋子', 4]
  theconfig.象 = ['象', '大梦终需醒，我倚剑笑苍天', '配角的位置，为何不能也大放光彩呢？', 3]
  theconfig.骑士 = ['骑士', '君载着黑骏马，威风凛凛寻她', '作为最后一道防线，保护好你的王，还有，保护好自己，所以就少出动吧', 2]
  theconfig.兵 = ['兵', '游走的狂徒，随时打出舍命一击', '价值堪比王，至于隐匿和伺机而动，就不必我多提示了吧', 1]
  theconfig.nowlist = { 白王: { type: 'white', identity: '王' }, 白后: { type: 'white', identity: '后' }, 白车: { type: 'white', identity: '车' }, 白象: { type: 'white', identity: '象' }, 白骑士: { type: 'white', identity: '骑士' }, 白兵: { type: 'white', identity: '兵' }, 黑王: { type: 'black', identity: '王' }, 黑后: { type: 'black', identity: '后' }, 黑车: { type: 'black', identity: '车' }, 黑象: { type: 'black', identity: '象' }, 黑骑士: { type: 'black', identity: '骑士' }, 黑兵: { type: 'black', identity: '兵' } }
  theconfig.havelist = ['白王', '白后', '白车', '白象', '白骑士', '白兵', '黑王', '黑后', '黑车', '黑象', '黑骑士', '黑兵']
  theconfig.time = 0
  theconfig.white = []
  theconfig.black = []

  try {
    const folderexists = fs.existsSync(path.join(api.Data, './chess/user/'))
    if (folderexists === true) {
      const dirList = fs.readdirSync(path.join(api.Data, './chess/user/'))
      dirList.forEach(function (fileName: any) {
        fs.unlinkSync(path.join(api.Data, './chess/user/') + fileName)
      })
    }
  } catch (error) {
  }
  const watch = per.users.has('chess.watch')
  watch.forEach(uid => {
    try {
      per.users.removePermission(String(uid), 'chess.watch')
    } catch (error) {
      reply(`[Chess] 观战权限添加失败: ${error.message}`, '666ccff')
    }
  })
  update('config', 'config', theconfig)
  reply('重置成功', '66ccff')
})

// 随机角色
api.command(/^check$/, 'chess.get', async (m, e, reply) => {
  const configconfig = getjson('config', 'config')
  const userconfig = getjson('user', e.uid)
  uidMap.set(` [*${e.username}*] `, e.uid)
  if (configconfig.havelist.every(isError) === true) {
    delete configconfig.havelist
    update('user', 'config', configconfig)
  }
  if (configconfig.havelist == null) {
    api.method.sendPrivateMessage(e.uid, '卡池已空', '66ccff')
    api.method.sendPublicMessage('所有角色领取完毕', '66ccff')
  } else if (userconfig.identity) {
    let a:string = ''
    if (userconfig.way === 'white') { a = '白' }
    if (userconfig.way === 'black') { a = '黑' }
    api.method.sendPrivateMessage(e.uid, `您已有身份，身份为：【${a + '·' + userconfig.identity}】`, '66ccff')
  } else {
    const sequence:number = random(0, configconfig.havelist.length - 1)
    const num = configconfig.havelist[sequence]
    userconfig.identity = configconfig.nowlist[num].identity
    userconfig.way = configconfig.nowlist[num].type
    userconfig.attack = configconfig[userconfig.identity][3]
    configconfig.havelist.splice(sequence, 1)
    if (configconfig.havelist.every(isError) === true) {
      delete configconfig.havelist
      update('user', 'config', configconfig)
    }
    const groupconfig = getjson('user', `${userconfig.way}group`)
    if (groupconfig.user == null) {
      groupconfig.user = []
    }
    if (groupconfig.list == null) {
      groupconfig.list = []
    }
    groupconfig.user.push(` [*${e.username}*] `)
    groupconfig.list.push(userconfig.identity)
    if (configconfig[userconfig.way] == null) {
      configconfig[userconfig.way] = []
    }
    configconfig[userconfig.way].push(` [*${e.username}*] `)
    update('config', 'config', configconfig)
    update('user', e.uid, userconfig)
    update('user', `${userconfig.way}group`, groupconfig)
    const idconfig = getjson('user', 'config')
    if (idconfig.id === undefined) {
      idconfig.id = {}
    }
    idconfig.id[e.username] = e.uid
    update('user', 'config', idconfig)
    let a = ''
    if (userconfig.way === 'white') { a = '白' }
    if (userconfig.way === 'black') { a = '黑' }
    api.method.sendPublicMessage(` [*${e.username}*]   :  已加入阵营：【${a}】`, '66ccff')
    api.method.sendPrivateMessage(e.uid, `您的身份为：${a + userconfig.identity + '\n\n'}【${userconfig.identity}】 ${'\nTip:  ' + configconfig[userconfig.identity][1] + '\n'}请务必不要以任何形式向敌人透露出自己的具体身份哦~`, '66ccff')
  }
})

// 查看阵营列表
api.command(/^chess group$/, 'chess.group', async (m, e, reply) => {
  const whitegroupconfig = getjson('user', 'whitegroup')
  const blackgroupconfig = getjson('user', 'blackgroup')
  try {
    const white = whitegroupconfig.user.join('\n')
    reply(`  【白色方阵】  ：${'\n\n' + white}`, '66ccff')
    const black = blackgroupconfig.user.join('\n')
    reply(`  【黑色方阵】  ：${'\n\n' + black}`, '66ccff')
  } catch (error) {
  }
})

// 攻击
api.command(/^attack(.*)$/, 'chess.attack', async (m, e, reply) => {
  const attackgroup = getjson('user', 'config')
  const m1: any = m[1].match(/\*(.*)\*/)

  const id = uidMap.get(` [*${m1[1]}*] `)
  const attackconfig = getjson('user', e.uid)

  if (attackgroup.over === 1) return reply('本局对战已结束', '66ccff')
  if (attackgroup.attack !== attackconfig.way) return reply('未到您的阵容攻击', '66ccff')
  if (attackconfig.alive === 1) return reply('您已阵亡，无法攻击', '66ccff')

  if (id) {
    const defenseconfig = getjson('user', id)

    if (defenseconfig === {}) return reply(` [*${e.username}*] 您攻击的目标不正确`, '66ccff')
    if (attackconfig.way === defenseconfig.way) return reply(` [*${e.username}*] 唔...无法攻击相同阵容`, '66ccff')
    if (defenseconfig.alive === 1) return reply('您攻击的对象已阵亡，无法攻击', '66ccff')
    if (attackconfig.attack === 6) api.method.sendPublicMessage(`【 [*${e.username}*] 】为王`, '66ccff')

    const out:any = duel(attackconfig, defenseconfig)
    let a:string = ''
    let b:string = ''

    if (out[0] > out[1]) {
      killon(defenseconfig.identity, defenseconfig.way)

      // 删除失败者数据
      defenseconfig.alive = 1
      reply(`【 [*${e.username}*] 】  获得胜利！`, '66ccff')
    } else if (out[0] === out[1]) {
      killon(defenseconfig.identity, defenseconfig.way)
      killon(attackconfig.identity, attackconfig.way)
      if (attackconfig.way === 'white') { a = '白' }
      if (attackconfig.way === 'black') { a = '黑' }
      if (defenseconfig.way === 'white') { b = '白' }
      if (defenseconfig.way === 'black') { b = '黑' }
      attackgroup.fire = a
      attackgroup.fire2 = b

      // 删除失败者数据
      defenseconfig.alive = 1
      attackconfig.alive = 1
      reply(`【 [*${e.username}*] 】  【 [*${m1[1]}*] 】 均失败！`, '66ccff')
    } else if (out[0] < out[1]) {
      killon(attackconfig.identity, attackconfig.way)

      // 删除失败者数据
      attackconfig.alive = 1
      reply(`【 [*${m1[1]}*] 】  获得胜利！`, '66ccff')
    }
    delete attackgroup.attack
    const white = getjson('user', 'whitegroup')
    const black = getjson('user', 'blackgroup')
    let whiteking:number = 0
    let blackking:number = 0
    for (let i = 0; i < white.list.length; i++) {
      if (white.list[i] === '王') {
        whiteking = 1
      }
    }
    for (let i = 0; i < black.list.length; i++) {
      if (black.list[i] === '王') {
        blackking = 1
      }
    }
    const whitenum = white.list.length
    const blacknum = black.list.length

    if (whiteking === 1 && blackking === 1) {
      attackgroup.over = 0
      reply('本轮攻击结束，请继续下一回合', '66ccff')
    } else if (whiteking === 0 && blackking === 1) {
      attackgroup.over = 1
      reply(`【游戏结束】${'\n\n'}白色阵营失败，黑色阵营获得胜利`, '66ccff')
    } else if (blackking === 0 && whiteking === 1) {
      attackgroup.over = 1
      reply(`【游戏结束】${'\n\n'}黑色阵营失败，白色阵营获得胜利`, '66ccff')
    } else if (blackking === 0 && whiteking === 0) {
      if (blacknum > 0 && whitenum > 0) {
        attackgroup.over = 0
        reply('本轮攻击结束，请继续下一回合', '66ccff')
      } else if (blacknum <= 0 && whitenum > 0) {
        attackgroup.over = 1
        reply(`【游戏结束】${'\n\n'}黑色阵营失败，白色阵营获得胜利`, '66ccff')
      } else if (blacknum > 0 && whitenum <= 0) {
        attackgroup.over = 1
        reply(`【游戏结束】${'\n\n'}白色阵营失败，黑色阵营获得胜利`, '66ccff')
      } else if (blacknum === 0 && whitenum === 0) {
        attackgroup.over = 1
        reply(`【游戏结束】${'\n\n' + b}色阵营失败，${a}色阵营获得胜利`, '66ccff')
      }
    }
    update('user', id, defenseconfig)
    update('user', e.uid, attackconfig)
    update('user', 'config', attackgroup)
  }
})

// 选择攻击方
api.command(/^请(白|黑)方攻击$/, 'chess.hava', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'chess.op') && !per.users.hasPermission(e.uid, 'permission.chess')) return reply(' [chess] : 您不是主持人', '66ccff')
  const attackgroup = getjson('user', 'config')
  let a:string = ''
  if (m[1] === '白') { a = 'white' }
  if (m[1] === '黑') { a = 'black' }
  attackgroup.attack = a
  update('user', 'config', attackgroup)
})

api.command(/^chess i$/, 'chess.i', async (m, e, reply) => {
  const user = getjson('user', e.uid)
  if (user.identity) {
    let a
    if (user.way === 'white') { a = '白' }
    if (user.way === 'black') { a = '黑' }
    api.method.sendPrivateMessage(e.uid, `您的角色为: 【${a + user.identity}】`, '66ccff')
  }
})

// 查看战况
api.command(/^chess have$/, 'chess.on', async (m, e, reply) => {
  const whitegroupconfig = getjson('user', 'whitegroup')
  const blackgroupconfig = getjson('user', 'blackgroup')
  const user = getjson('user', e.uid)
  let whiteUnits:string = ''
  let blackUnits:string = ''
  try {
    if (user.way === 'white') {
      for (let i = 0; i < whitegroupconfig.list.length; i++) {
        whiteUnits = whiteUnits + `${'\n\n' + whitegroupconfig.list[i]} : ${whitegroupconfig.user[i]}`
      }
      api.method.sendPrivateMessage(e.uid, `  【白色方阵】  ：${'\n\n' + whiteUnits}`, '66ccff')
    }
    if (user.way === 'black') {
      for (let i = 0; i < blackgroupconfig.list.length; i++) {
        blackUnits = blackUnits + `${'\n\n' + blackgroupconfig.list[i]} : ${blackgroupconfig.user[i]}`
      }
      api.method.sendPrivateMessage(e.uid, `  【黑色方阵】  ：${'\n\n' + blackUnits}`, '66ccff')
    }
  } catch (error) {}
})

// 查看战况
api.command(/^chess all$/, 'chess.all', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'chess.op') && !per.users.hasPermission(e.uid, 'permission.chess')) return reply(' [chess] : 您不是主持人', '66ccff')
  const whitegroupconfig = getjson('user', 'whitegroup')
  const blackgroupconfig = getjson('user', 'blackgroup')
  let whiteUnits:string = ''
  let blackUnits:string = ''
  try {
    for (let i = 0; i < whitegroupconfig.list.length; i++) {
      whiteUnits = whiteUnits + `${'\n' + whitegroupconfig.list[i]} : ${whitegroupconfig.user[i]}`
    }
    api.method.sendPrivateMessage(e.uid, `  【白色方阵】  ：${'\n' + whiteUnits}`, '66ccff')
  } catch (error) {}
  try {
    for (let i = 0; i < blackgroupconfig.list.length; i++) {
      blackUnits = blackUnits + `${'\n' + blackgroupconfig.list[i]} : ${blackgroupconfig.user[i]}`
    }
    api.method.sendPrivateMessage(e.uid, `  【黑色方阵】  ：${'\n' + blackUnits}`, '66ccff')
  } catch (error) {}
})

// 观战开始
api.command(/^chess watch on$/, 'chess.watch.on', async (m, e, reply) => {
  try {
    per.users.addPermission(e.uid, 'chess.watch')
    reply('[Chess] 观战权限添加成功', '666ccff')
  } catch (error) {
    reply(`[Chess] 观战权限添加失败: ${error.message}`, '666ccff')
  }
})

// 观战结束
api.command(/^chess watch off$/, 'chess.watch.off', async (m, e, reply) => {
  try {
    per.users.removePermission(e.uid, 'chess.watch')
    reply('[Chess] 观战权限移除成功', '666ccff')
  } catch (error) {
    reply(`[Chess] 观战权限移除失败: ${error.message}`, '666ccff')
  }
})

/*
// 记录进入房间的人
api.Event.on('JoinRoom', (msg) => {
  const haveUser = getjson('list', 'list')
  if (haveUser.playerIdList == null) {
    haveUser.playerIdList = []
  }
  if (haveUser.playerNameList == null) {
    haveUser.playerNameList = []
  }
  if (haveUser.playerIdList.length > 30) return
  for (let i = 0; i < haveUser.playerIdList.length; i++) {
    if (haveUser.playerIdList[i] === msg.uid) {
      return // 已记录
    }
  }
  haveUser.playerIdList.push(msg.uid)
  haveUser.playerNameList.push(msg.username)
  update('list', 'list', haveUser)
  // 未记录
})

// 清除记录的用户
api.command(/^chess list clear$/, 'chess.list.clear', async (m, e, reply) => {
  const listconfig = getjson('list', 'list')
  listconfig.playerIdList = []
  listconfig.playerNameList = []
  update('list', 'list', listconfig)
})

// 查看入围列表
api.command(/^chess list$/, 'chess.name', async (m, e, reply) => {
  const haveUser = getjson('list', 'list')
  if (!per.users.hasPermission(e.uid, 'chess.op') && !per.users.hasPermission(e.uid, 'permission.chess')) return reply(' [chess] : 您不是主持人', '66ccff')
  let NameUnits = ''
  if (haveUser.playerIdList == null) {
    haveUser.playerIdList = []
  }
  if (haveUser.playerNameList == null) {
    haveUser.playerNameList = []
  }
  try {
    for (let i = 0; i < haveUser.playerIdList.length; i++) {
      NameUnits = NameUnits + `${'\n' + (i + 1) + '.   [*' + haveUser.playerNameList[i]}*]   :   [@${haveUser.playerIdList[i]}@] `
    }
    api.method.sendPrivateMessage(e.uid, `  【已记录人员】  ：${'\n' + NameUnits}`, '66ccff')
  } catch (error) {}
})
*/

// 观战位，id使用苏苏的内个
