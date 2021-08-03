import { existsSync } from 'fs'
import path from 'path'
import * as Ran from '../../lib/api'
import Game from './lib/game'
import { RoleList } from './lib/role'
import user from './lib/user'

const isAdmin = (uid: string): boolean => {
  if (!process.env.ADMIN) return false
  const adminList = process.env.ADMIN.split(',')
  return adminList.includes(uid)
}

Ran.Event.once('login', () => {
  if (existsSync(path.join(Ran.Data, 'wolf', 'info.json'))) {
    Ran.method.sendPublicMessage('[Wolf] 程序异常退出，正在尝试恢复数据...')
    game = new Game()
    try {
      game.recovery()
    } catch (error) {
      Ran.method.sendPublicMessage('[Wolf] 数据恢复失败, 正在清空数据...')
      game.clear()
      game.flag.isEnd = true
      Ran.method.sendPublicMessage('[Wolf] 数据清空完成')
    }
  }
})

// @ts-ignore
let game: Game = null

Ran.command(/^\.wolf rank (\d+)$/, 'wolf.rank', async (match, event, reply) => {
  reply('[Wolf] 正在读取数据...')
  const data = await user.getRank(Number(match[1]))
  const msg = data.map((item, index) => `${index + 1}.  [@${item.uid}@]  ${Math.round(item.point * 1e3) / 1e3}分`).join('\n')
  reply(msg)
})

Ran.command(/^\.wolf mark (\d+) (.*)$/, 'wolf.mark', async (match, event, reply) => {
  if (!game) return reply('[Wolf] 你还没有创建游戏')
  if (!game.flag.start) return reply('[Wolf] 游戏还没开始')
  if (game.getGIDByUid(event.uid) === -1) return reply('[Wolf] 你没有加入这局游戏')

  const id = Number(match[1])
  const mark = match[2]

  if (!game.Roles[id]) return reply('[Wolf] 玩家不存在')

  game.Roles[id].user.mark = mark
  reply('[Wolf] 标记成功')
})

Ran.command(/^\.wolf create$/, 'wolf.create', (match, event, reply) => {
  if (game && !game.flag.isEnd) return reply('[Wolf] 已经有一个正在运行的游戏了')
  if (game && game.flag.isEnd) {
    game.clear()
    // @ts-ignore
    game = null
  }

  game = new Game()

  reply(` [*${event.username}*]  敲响了末日的钟声！ 发送 加入游戏 来参加这场屠杀宴会……说不定会暴死当场！`)

  game.join({
    uid: event.uid,
    username: event.username,
    score: 0,
    mark: '无'
  })

  Ran.Event.once('SwitchRoom', event => game.left(event.uid))
  Ran.Event.once('LeaveRoom', event => game.left(event.uid))

  reply(` [*${event.username}*]  加入了游戏，请勿在游戏中修改自己的名字`)

  game.onEnd = () => {
    game.clear()
    // @ts-ignore
    game = null
  }
})

Ran.command(/^\.wolf start$/, 'wolf.start', (match, event, reply) => {
  if (!game) return reply('[Wolf] 你还没有创建游戏')
  if (game.users[0].uid !== event.uid) return reply('[Wolf] 这个游戏不是你创建的')

  game.start()
})

Ran.command(/^\.wolf stop$/, 'wolf.stop', (match, event, reply) => {
  if (!game) return reply('[Wolf] 你还没有创建游戏')
  if (game.users[0].uid !== event.uid && !isAdmin(event.uid)) return reply('[Wolf] 这个游戏不是你创建的')

  game.flag.isEnd = true
  game.onEnd()

  reply('[Wolf] 游戏已被创建者强制结束')
})

Ran.command(/^\.wolf players$/, 'wolf.list', (match, event, reply) => {
  if (!game) return reply('[Wolf] 你还没有创建游戏')

  if (game.Roles.length > 0) {
    const msg = []

    for (const index in game.Roles) {
      const user = game.Roles[index]
      msg.push(`${index}. [${user.isAlive ? '存活' : '死亡'}][${user.user.mark}]  [*${user.user.username}*] `)
    }

    reply(msg.join('\n'))
  } else {
    const msg = []

    for (const index in game.users) {
      const user = game.users[index]
      msg.push(`${index}. [*${user.username}*] `)
    }

    reply(msg.join('\n'))
  }
})

Ran.command(/^\.wolf join$/, 'wolf.join', (match, event, reply) => {
  if (!game) return reply('[Wolf] 你还没有创建游戏')
  if (game.flag.start) return reply('[Wolf] 游戏已经开始了')

  const result = game.join({
    uid: event.uid,
    username: event.username,
    score: 0,
    mark: '无'
  })

  Ran.Event.once('SwitchRoom', event => game.left(event.uid))
  Ran.Event.once('LeaveRoom', event => game.left(event.uid))

  if (result) reply(` [*${event.username}*]  加入了游戏，请勿在游戏中修改自己的名字`)
  if (!result) reply(` [*${event.username}*]  加入失败`)
})

Ran.command(/^\.wolf left$/, 'wolf.left', (match, event, reply) => {
  if (!game) return reply('[Wolf] 你还没有创建游戏')
  if (game.flag.start) return reply('[Wolf] 游戏已经开始了')

  const result = game.left(event.uid)

  if (!result) reply(` [*${event.username}*]  退出失败`)
})

Ran.command(/^\.wolf role (\S+)$/, 'wolf.role', (match, event, reply) => {
  // @ts-ignore
  if (!RoleList[match[1]]) return reply('[Wolf] 未知的角色')
  reply(RoleList[match[1]].intro)
})

Ran.command(/^\.wolf rolelist$/, 'wolf.rolelist', (match, event, reply) => {
  const msg = []
  for (const id in RoleList) {
    // @ts-ignore
    msg.push(`.wolf role ${id} - ${RoleList[id].name}`)
  }

  reply(msg.join('\n'))
})
