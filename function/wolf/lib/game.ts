import * as Ran from '../../../lib/api'
import Role, { User } from './Role/default'
import { RoleList, Role as RoleMap } from './role'
import logger from '../../../lib/logger'
import { inspect } from 'util'
import config from '../../../config'
import { EventEmitter } from 'events'
import { deleteFolder, getRole } from './utils'
import user from './user'
import fs from 'fs'
import path from 'path'

interface Hook {
  level: number,
  name: string,
  type: 'day' | 'night',
  callback: (game: any) => void
}

interface VolInfo {
  flags: {
    isEnd: boolean
    start: boolean
    type: 'Wolf' | 'Fire'
  }
  stage: 'day' | 'night' | 'vote'
  id: string
  dayMessage: string[]
  users: User[]
}

interface VolRoles {
  id: string
  isAlive: boolean
  user: User
  flags: any
}

export const roleTools = {
  // @ts-ignore
  getType: (id: string) => RoleList[id].type
}

const event = new EventEmitter()

Ran.Event.on('PublicMessage', e => {
  event.emit(`${e.uid}-${e.message}`)
})

export default class Game {
  public users: User[]
  public Roles: Role[]
  public onEnd: () => void

  private hooks: Hook[]
  private dayMessage: string[]
  private id: string
  private root: string

  private stage: 'day' | 'night' | 'vote'

  public flag: {
    isEnd: boolean,
    start: boolean,
    type: 'Wolf' | 'Fire'
  }

  constructor () {
    this.onEnd = () => { }

    this.stage = 'night'
    this.root = path.join(Ran.Data, 'wolf')
    this.id = (Math.random() * 1e16).toString(16).split('.')[0]

    this.users = []
    this.Roles = []
    this.hooks = []
    this.dayMessage = []
    this.flag = {
      isEnd: false,
      start: false,
      type: 'Wolf'
    }

    try {
      fs.mkdirSync(this.root)
    } catch (error) { }
  }

  /**
   * @description 保存数据到硬盘
   */
  save () {
    const info: VolInfo = {
      flags: this.flag,
      stage: this.stage,
      id: this.id,
      dayMessage: this.dayMessage,
      users: this.users
    }

    const roles: VolRoles[] = this.Roles.map(e => {
      return {
        id: e.roleId,
        isAlive: e.isAlive,
        user: e.user,
        flags: e.flag
      }
    })

    try {
      fs.writeFileSync(`${this.root}/info.json`, JSON.stringify(info))
      fs.writeFileSync(`${this.root}/roles.json`, JSON.stringify(roles))
    } catch (error) {
      logger('Sync').warn('文件写入失败', error)
    }
  }

  /**
   * @description 恢复数据
   */
  recovery () {
    const info: VolInfo = JSON.parse(fs.readFileSync(`${this.root}/info.json`).toString())
    const roles: VolRoles[] = JSON.parse(fs.readFileSync(`${this.root}/roles.json`).toString())

    this.flag = info.flags
    this.stage = info.stage
    this.id = info.id
    this.dayMessage = info.dayMessage
    this.users = info.users

    for (const index in roles) {
      const role = roles[index]
      // @ts-ignore
      const Role = RoleMap[role.id]
      this.Roles[index] = new Role(role.user)
      this.Roles[index].flag = role.flags
      this.Roles[index].isAlive = role.isAlive
    }

    const stageMap = {
      day: this.day,
      night: this.night,
      vote: this.vote
    }

    if (this.flag.start) stageMap[info.stage]()

    Ran.method.sendPublicMessage('数据恢复完成!')
  }

  /**
   * 清理数据
   */
  clear () {
    try {
      deleteFolder(this.root)
    } catch (error) {
      logger('Vol').error('数据删除失败', error)
    }
  }

  /**
   * @description 获取下一个活着的玩家
   * @param id 玩家id
   */
  getNextAlive (id: number): number {
    for (const index in this.Roles) {
      const role = this.Roles[index]
      if (!role) return -1
      if (Number(index) > id && role.isAlive) return Number(index)
    }

    return -1
  }

  /**
   * @description 通过uid获取玩家id
   * @param uid uid
   */
  getGIDByUid (uid: string): number {
    for (const index in this.users) {
      const user = this.users[index]
      if (user.uid === uid) return Number(index)
    }

    return -1
  }

  /**
   * @description 通过uid获取玩家id
   * @param uid uid
   */
  getIDByUid (uid: string): number | undefined {
    for (const index in this.Roles) {
      const user = this.Roles[index]
      if (user.user.uid === uid) return Number(index)
    }
  }

  /**
   * @description 通过uid获取玩家
   * @param uid uid
   */
  getUserByUid (uid: string) {
    for (const user of this.users) {
      if (user.uid === uid) return user
    }
  }

  /**
   * @description 通过Role获取玩家
   * @param role Role
   */
  getUserByRole (role: string): Role[] {
    const result = []

    for (const user of this.Roles) {
      if (user.roleId === role) result.push(user)
      if (role === 'all') result.push(user)
    }

    return result
  }

  /**
   * @description 注册hook
   * @param type 类型
   * @param level 优先级
   * @param callback 回调函数
   */
  registerHook (type: 'day' | 'night', name: string, level: number, callback: (game: this) => void) {
    this.hooks.push({
      type: type,
      name: name,
      level: level,
      callback: callback
    })
  }

  /**
   * @description 获取Hook
   * @param type 类型
   */
  getHooks (type: 'day' | 'night') {
    const hooks = this.hooks.filter(item => item.type === type).sort((a, b) => b.level - a.level)
    logger('Wolf [Hook]').info(`Hook: ${hooks.map(e => e.name).join(', ')}`)
    return hooks.map(e => e.callback)
  }

  /**
   * @description 加入游戏
   * @param user 用户信息
   */
  join (user: User) {
    if (this.getUserByUid(user.uid)) return false
    this.users.push(user)
    this.save()
    return true
  }

  /**
   * @description 退出游戏
   * @param uid uid
   */
  left (uid: string) {
    if (this.flag.start) return false

    const id = this.getGIDByUid(uid)
    if (id === -1) return false

    Ran.method.sendPublicMessage(`[Wolf] ${this.users[id].username} 无法抵御良心的煎熬，逃离了这场暴民的盛会。`)
    this.users.splice(id, 1)

    if (id === 0) {
      Ran.method.sendPublicMessage(`[Wolf] 创建者已离开游戏，新的创建者是 ${this.users[0].username}`)
    }

    this.save()
    return true
  }

  /**
   * @description 玩家变化时判断游戏是否结束
   */
  playerChange () {
    // 如果结束就跳过结算
    if (this.flag.isEnd) return

    const aliveUserList: Role[] = []
    for (const user of this.Roles) {
      if (user.isAlive) aliveUserList.push(user)
    }

    const WolfLen = aliveUserList.filter(e => roleTools.getType(e.roleId) === 'Wolf').length
    const HumanLen = aliveUserList.filter(e => roleTools.getType(e.roleId) === 'Human' || roleTools.getType(e.roleId) === 'Tanner').length
    const FireLen = aliveUserList.filter(e => roleTools.getType(e.roleId) === 'Fire' || roleTools.getType(e.roleId) === 'Tanner').length
    const TannerLen = aliveUserList.filter(e => roleTools.getType(e.roleId) === 'Tanner').length

    const isWolf = WolfLen === aliveUserList.length
    const isHuman = HumanLen === aliveUserList.length
    const isFire = FireLen === aliveUserList.length
    const isTanner = TannerLen === aliveUserList.length

    this.save()

    if (isTanner) {
      this.flag.isEnd = true
      Ran.method.sendPublicMessage('游戏结束\n胜利还是属于死亡, 👺圣战者在清晨的阳光中走入了烈火，世界最终会归尽，#圣战者胜。')

      // 记录数据
      this.Roles.forEach((item, index) => {
        if (roleTools.getType(item.roleId) === 'Tanner') {
          let weights = 1 - this.Roles.filter(e => e.isAlive).length / this.Roles.length
          if (!item.isAlive) weights = weights - 0.1 < 0 ? 0.05 : weights - 0.1

          this.Roles[index].user.score += weights

          user.writeResult(this.id, item.user.uid, item.roleId, weights, true)
        } else {
          const weights = this.Roles.filter(e => !e.isAlive).length / this.Roles.length

          this.Roles[index].user.score += weights

          user.writeResult(this.id, item.user.uid, item.roleId, weights, false)
        }
      })

      Ran.method.sendPublicMessage(this.Roles.map(e => `[${roleTools.getType(e.roleId) === 'Tanner' ? '胜利' : '失败'}][${RoleList[e.roleId].name}][${e.user.score}][${e.isAlive ? '存活' : '死亡'}] ${e.user.username}`).join('\n'))
      this.dayMessage.forEach(msg => {
        Ran.method.sendPublicMessage(msg)
      })
    } else if (isWolf) {
      this.flag.isEnd = true
      Ran.method.sendPublicMessage('游戏结束\n#狼人胜！ 看来这届村民不行啊！')

      // 记录数据
      this.Roles.forEach((item, index) => {
        if (roleTools.getType(item.roleId) === 'Wolf') {
          let weights = 1 - this.Roles.filter(e => e.isAlive).length / this.Roles.length
          if (!item.isAlive) weights = weights - 0.1 < 0 ? 0.05 : weights - 0.1

          this.Roles[index].user.score += weights

          user.writeResult(this.id, item.user.uid, item.roleId, weights, true)
        } else {
          const weights = this.Roles.filter(e => !e.isAlive).length / this.Roles.length

          this.Roles[index].user.score += weights

          user.writeResult(this.id, item.user.uid, item.roleId, weights, false)
        }
      })

      Ran.method.sendPublicMessage(this.Roles.map(e => `[${roleTools.getType(e.roleId) === 'Wolf' ? '胜利' : '失败'}][${RoleList[e.roleId].name}][${e.user.score}][${e.isAlive ? '存活' : '死亡'}] ${e.user.username}`).join('\n'))
      this.dayMessage.forEach(msg => {
        Ran.method.sendPublicMessage(msg)
      })
    } else if (WolfLen / aliveUserList.length >= 0.5) {
      this.flag.isEnd = true
      Ran.method.sendPublicMessage('游戏结束\n#狼人胜！ 看来这届村民不行啊！')

      // 记录数据
      this.Roles.forEach((item, index) => {
        if (roleTools.getType(item.roleId) === 'Wolf') {
          let weights = 1 - this.Roles.filter(e => e.isAlive).length / this.Roles.length
          if (!item.isAlive) weights = weights - 0.1 < 0 ? 0.05 : weights - 0.1

          this.Roles[index].user.score += weights

          user.writeResult(this.id, item.user.uid, item.roleId, weights, true)
        } else {
          const weights = this.Roles.filter(e => !e.isAlive).length / this.Roles.length

          this.Roles[index].user.score += weights

          user.writeResult(this.id, item.user.uid, item.roleId, weights, false)
        }
      })

      Ran.method.sendPublicMessage(this.Roles.map(e => `[${roleTools.getType(e.roleId) === 'Wolf' ? '胜利' : '失败'}][${RoleList[e.roleId].name}][${e.user.score}][${e.isAlive ? '存活' : '死亡'}] ${e.user.username}`).join('\n'))
      this.dayMessage.forEach(msg => {
        Ran.method.sendPublicMessage(msg)
      })
    } else if (isHuman) {
      this.flag.isEnd = true
      Ran.method.sendPublicMessage('游戏结束\n#人类胜！')

      // 记录数据
      this.Roles.forEach((item, index) => {
        if (roleTools.getType(item.roleId) === 'Human') {
          let weights = 1 - this.Roles.filter(e => e.isAlive).length / this.Roles.length
          if (!item.isAlive) weights = weights - 0.1 < 0 ? 0.05 : weights - 0.1

          this.Roles[index].user.score += weights

          user.writeResult(this.id, item.user.uid, item.roleId, weights, true)
        } else {
          const weights = this.Roles.filter(e => !e.isAlive).length / this.Roles.length

          this.Roles[index].user.score += weights

          user.writeResult(this.id, item.user.uid, item.roleId, weights, false)
        }
      })

      Ran.method.sendPublicMessage(this.Roles.map(e => `[${roleTools.getType(e.roleId) === 'Human' ? '胜利' : '失败'}][${RoleList[e.roleId].name}][${e.user.score}][${e.isAlive ? '存活' : '死亡'}] ${e.user.username}`).join('\n'))
      this.dayMessage.forEach(msg => {
        Ran.method.sendPublicMessage(msg)
      })
    } else if (isFire) {
      this.flag.isEnd = true
      Ran.method.sendPublicMessage('游戏结束\n清晨，昨夜的大火刚刚熄灭，除了🔥纵火犯，小镇空无一人。#纵火犯胜...')

      // 记录数据
      this.Roles.forEach((item, index) => {
        if (roleTools.getType(item.roleId) === 'Fire') {
          let weights = 1 - this.Roles.filter(e => e.isAlive).length / this.Roles.length
          if (!item.isAlive) weights = weights - 0.1 < 0 ? 0.05 : weights - 0.1

          this.Roles[index].user.score += weights

          user.writeResult(this.id, item.user.uid, item.roleId, weights, true)
        } else {
          const weights = this.Roles.filter(e => !e.isAlive).length / this.Roles.length

          this.Roles[index].user.score += weights

          user.writeResult(this.id, item.user.uid, item.roleId, weights, false)
        }
      })

      Ran.method.sendPublicMessage(this.Roles.map(e => `[${roleTools.getType(e.roleId) === 'Fire' ? '胜利' : '失败'}][${RoleList[e.roleId].name}][${e.user.score}][${e.isAlive ? '存活' : '死亡'}] ${e.user.username}`).join('\n'))
      this.dayMessage.forEach(msg => {
        Ran.method.sendPublicMessage(msg)
      })
    }

    if (this.flag.isEnd) {
      this.clear()
      this.onEnd()
    }
  }

  /**
   * @description 杀死一个人
   * @param role 请求来源身份
   * @param target 目标id
   */
  kill (role: string, target: number) {
    if (!this.Roles[target]) return false
    if (!this.Roles[target].isAlive) return false

    this.Roles[target].isAlive = false

    this.Roles[target].event.emit('death', role, this)

    // 狼人吃人
    if (role === 'WW') {
      Ran.method.sendPrivateMessage(this.Roles[target].user.uid, '糟糕！你已被狼人吃掉。')
      this.dayMessage.push(`📰新闻：居民闻到恶臭后报警，警察打开房门后发现， ${this.Roles[target].user.username} 惨遭杀害，${this.Roles[target].user.username}尸体仅剩少量碎片，犯罪现场留下了动物毛发。`)
    }

    // 女巫毒人
    if (role === 'Mage') {
      Ran.method.sendPrivateMessage(this.Roles[target].user.uid, '糟糕！你已被女巫毒死。')
      this.dayMessage.push(`📰新闻：${this.Roles[target].user.username} 昨晚死在了自己家中，地上还能看到一些残留的药水`)
    }

    // 纵火犯烧人
    if (role === 'Fire') {
      Ran.method.sendPrivateMessage(this.Roles[target].user.uid, '糟糕！你已被烧死。')
      this.dayMessage.push(`📰新闻：昨晚有居民看到 ${this.Roles[target].user.username} 的家中冒出了巨大的火光，今天早上 ${this.Roles[target].user.username} 的家已经变成了废墟`)
    }

    // 猎人死亡后杀人
    if (role === 'Hunter1') {
      Ran.method.sendPrivateMessage(this.Roles[target].user.uid, '糟糕！你已被猎人鲨死。')
      this.dayMessage.push(`📰新闻：猎人在临死前开枪把 ${this.Roles[target].user.username} 打死了`)
    }

    // 被狼人咬死后鲨狼人
    if (role === 'Hunter2') {
      Ran.method.sendPrivateMessage(this.Roles[target].user.uid, '糟糕！你已被猎人鲨死。')
      this.dayMessage.push(`📰新闻：昨晚 ${this.Roles[target].user.username} 尝试带领狼群吃掉猎人，但是被猎人反杀了`)
    }

    if (role === 'Vote') Ran.method.sendPrivateMessage(this.Roles[target].user.uid, '糟糕！你已被投票处死。')

    this.playerChange()

    if (this.stage === 'day') {
      this.dayMessage.forEach(msg => {
        Ran.method.sendPublicMessage(msg)
      })

      this.dayMessage = []
    }

    this.save()

    return true
  }

  replace (id: number, newRole: Role) {
    logger('Wolf').info(`正在替换 ${this.Roles[id].user.username} 的身份...`)
    this.Roles[id].isAlive = false
    this.Roles[id] = newRole
    this.Roles[id].event.emit('gamestart', this)
    this.save()
  }

  /**
   * @description 晚上
   */
  async night () {
    if (this.flag.isEnd) return
    Ran.method.sendPublicMessage('夜幕降临，人们都活在恐惧中，彻夜难眠。这漫长的夜晚竟然有 <我也不知道> 秒！\n请所有夜晚（主动）行动的角色，私聊机器人以使用自己能力。')

    this.save()

    this.stage = 'night'
    const hooks = this.getHooks('night')

    for (const hook of hooks) {
      try {
        logger('Wolf [HOOK]').info('Running...')
        await hook(this)
      } catch (error) {
        Ran.method.sendPublicMessage(`Hook Error: ${inspect(error)}`)
      }
    }

    setTimeout(() => { if (!this.flag.isEnd) this.day() }, config.function.wolf.night)
  }

  /**
   * @description 白天
   */
  async day () {
    if (this.flag.isEnd) return
    Ran.method.sendPublicMessage('日上三竿，请尽快开始讨论和行动，讨论完毕后请创建者手动发送“结束讨论”\n请所有白天（主动）行动的角色，私聊机器人以使用自己能力。')

    this.save()

    this.stage = 'day'

    this.dayMessage.forEach(msg => {
      Ran.method.sendPublicMessage(msg)
    })

    this.dayMessage = []

    const hooks = this.getHooks('day')

    for (const hook of hooks) {
      try {
        logger('Wolf [HOOK]').info('Running...')
        await hook(this)
      } catch (error) {
        Ran.method.sendPublicMessage(`Hook Error: ${inspect(error)}`)
      }
    }

    event.once(`${this.users[0].uid}-结束讨论`, () => {
      if (!this.flag.isEnd) this.vote()
    })

    const index = this.getNextAlive(-1)
    Ran.method.sendPublicMessage(`[Wolf] 请 ${index} 号玩家  [*${this.Roles[index].user.username}*]  发言，发言结束后请发送 over 结束发言`)
  }

  /**
   * @description 开始投票阶段
   */
  async vote () {
    if (this.flag.isEnd) return
    Ran.method.sendPublicMessage(`黄昏将至，全民公投。\n请在 ${config.function.wolf.vote / 1e3} 秒内投票!\n请私聊机器人，及时进行投票。`)

    this.save()

    this.stage = 'vote'

    const votes = await this.createVote('all', '现在开始投票选择一个人', config.function.wolf.vote)
    const result = votes.map(item => {
      return {
        id: item.id,
        username: this.Roles[item.id].user.username,
        vote: item.vote
      }
    })

    if (votes.length > 1 && votes[0].vote === votes[1].vote) {
      Ran.method.sendPublicMessage('公投未能得出结论，刽子手只得失望离去')
    } else {
      this.kill('Vote', Number(result[0].id))
      Ran.method.sendPublicMessage(`  [*${result[0].username}*]  被投票处死了`)
    }

    Ran.method.sendPublicMessage([
      '投票结果如下:',
      ...result.map(item => `-   [*${item.username}*] : ${item.vote}票`)
    ].join('\n'))

    setTimeout(() => this.night(), 5e3)
  }

  /**
   * @description 创建投票
   * @param target 目标用户组
   * @param message 消息内容
   * @param timeout 超时
   */
  createVote (target: string | string[], message: string, timeout: number, allowSelf: boolean = false): Promise<{ id: number, vote: number }[]> {
    return new Promise((resolve, reject) => {
      const tmp = []
      if (typeof target === 'string') tmp.push(this.getUserByRole(target).filter(e => e.isAlive))
      if (typeof target !== 'string') target.forEach(role => tmp.push(this.getUserByRole(role).filter(e => e.isAlive)))
      const users = Array.from(new Set(tmp.flat()))
      const votes: number[] = []

      let isTimeout = false

      setTimeout(() => {
        isTimeout = true
        const voteList: {
          [index: number]: number
        } = {}

        for (const vote of votes) {
          if (!voteList[vote]) voteList[vote] = 0
          voteList[vote]++
        }

        const result: { id: number, vote: number }[] = []

        for (const id in voteList) {
          result.push({
            id: Number(id),
            vote: voteList[id]
          })
        }

        resolve(result.sort((a, b) => b.vote - a.vote))
      }, timeout)

      for (const user of users) {
        const msg = [
          message,
          '跳过本回合请随意发送一个下面列表中不存在的数字',
          ''
        ]

        for (const index in this.Roles) {
          const target = this.Roles[index]

          if (!target.isAlive) continue
          if (target.user.uid === user.user.uid && !allowSelf) continue

          msg.push(`${index}.   [*${target.user.username}*] `)
        }

        Ran.method.sendPrivateMessage(user.user.uid, msg.join('\n'))

        user.event.once('select_user', id => {
          if (isTimeout) return
          logger('Vote').info(user.user.username, '选择了', id)
          if (!this.Roles[id]) return Ran.method.sendPrivateMessage(user.user.uid, '弃权成功')
          if (!this.Roles[id].isAlive) return Ran.method.sendPrivateMessage(user.user.uid, '你将票投给了一个已经去世的人，视为弃权')
          if (this.Roles[id].user.uid === user.user.uid && !allowSelf) return Ran.method.sendPrivateMessage(user.user.uid, '你将票投给了自己，视为弃权')

          votes.push(id)

          Ran.method.sendPrivateMessage(user.user.uid, '投票成功')
        })
      }
    })
  }

  async createSelect (target: number, message: string, timeout: number, allowSelf: boolean = false) {
    return new Promise((resolve, reject) => {
      const user = this.Roles[target]
      let isTimeout = false

      setTimeout(() => {
        isTimeout = true
        resolve(-1)
      }, timeout)

      const msg = [
        message,
        '跳过本回合请随意发送一个下面列表中不存在的数字',
        `你有 ${timeout / 1e3} 秒的时间进行选择`,
        ''
      ]

      for (const index in this.Roles) {
        const target = this.Roles[index]

        if (!target.isAlive) continue
        if (target.user.uid === user.user.uid && !allowSelf) continue

        msg.push(`${index}.   [*${target.user.username}*] `)
      }

      Ran.method.sendPrivateMessage(user.user.uid, msg.join('\n'))

      user.event.once('select_user', id => {
        if (isTimeout) return
        logger('Select').info(user.user.username, '选择了', id)
        if (!this.Roles[id]) {
          Ran.method.sendPrivateMessage(user.user.uid, '弃权成功')
          return resolve(-1)
        }

        if (!this.Roles[id].isAlive) {
          Ran.method.sendPrivateMessage(user.user.uid, '你将选择了一个已经去世的人，视为弃权')
          return resolve(-1)
        }

        if (this.Roles[id].user.uid === user.user.uid && !allowSelf) {
          Ran.method.sendPrivateMessage(user.user.uid, '你将选择了自己，视为弃权')
          return resolve(-1)
        }

        if (!this.Roles[id]) Ran.method.sendPrivateMessage(user.user.uid, '选择成功')
        resolve(Number(id))
      })
    })
  }

  async start () {
    Ran.method.sendPublicMessage('[Wolf] 正在分配身份，请稍等...')

    if (this.users.length < 6) return Ran.method.sendPublicMessage('[Wolf] 人数不足，无法开启游戏')

    this.flag.start = true

    const type = Math.random() > 0.5 ? 0 : 1
    // const type = 0

    // @ts-ignore
    if (type === 0) {
      this.flag.type = 'Wolf'
      const list: typeof Role[] = getRole(this.users.length, 'Wolf')

      for (const index in this.users) {
        if (!this.users[index]) continue
        const Role = list[index]
        logger(`Wolf [${index}]`).info(`正在创建 ${this.users[index].username} 的身份...`)
        this.Roles.push(new Role(this.users[index]))

        const user = this.Roles[this.Roles.length - 1]

        if (user.roleId === 'Fool') {
          Ran.method.sendPrivateMessage(user.user.uid, `你的身份是 ${RoleList.Seer.name}\n\n${RoleList.Seer.intro}`)
        } else {
          // @ts-ignore
          Ran.method.sendPrivateMessage(user.user.uid, `你的身份是 ${RoleList[user.roleId].name}\n\n${RoleList[user.roleId].intro}`)
        }
      }
    } else if (type === 1) {
      this.flag.type = 'Fire'
      const list: typeof Role[] = getRole(this.users.length, 'Fire')

      const WolfList: string[] = []

      for (const index in this.users) {
        const Role = list[index]
        logger(`Wolf [${index}]`).info(`正在创建 ${this.users[index].username} 的身份...`)
        this.Roles.push(new Role(this.users[index]))

        const user = this.Roles[this.Roles.length - 1]

        if (user.roleId === 'Fool') {
          Ran.method.sendPrivateMessage(user.user.uid, `你的身份是 ${RoleList.Seer.name}\n\n${RoleList.Seer.intro}`)
        } else {
          // @ts-ignore
          Ran.method.sendPrivateMessage(user.user.uid, `你的身份是 ${RoleList[user.roleId].name}\n\n${RoleList[user.roleId].intro}`)
        }

        if (roleTools.getType(user.roleId) === 'Wolf') WolfList.push(user.user.uid)
      }
    }

    Ran.method.sendPublicMessage('[Wolf] 身份分配完成，游戏开始')

    this.Roles.forEach((role, index) => {
      role.event.emit('gamestart', this)

      role.event.on('over', () => {
        if (this.flag.isEnd) return
        if (this.getNextAlive(index) === -1) {
          Ran.method.sendPublicMessage(`[Wolf] 发言结束，请  [*${this.Roles[0].user.username}*]  结束讨论`)
          return
        }
        Ran.method.sendPublicMessage(`[Wolf] 请 ${this.getNextAlive(index)} 号玩家  [*${this.Roles[this.getNextAlive(index)].user.username}*]  发言，发言结束后请发送 over 结束发言`)
      })
    })

    const hasBuged = Array.from(new Set(this.Roles.map(e => e.user.uid))).length !== this.Roles.length
    if (hasBuged) Ran.method.sendPublicMessage('[WARN] 检测到可能出现了bug，请管理员手动发送 restart 重启游戏')

    this.save()

    setTimeout(() => this.night(), 5e3)
  }
}
