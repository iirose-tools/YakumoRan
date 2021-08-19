import fs from 'fs'
import path from 'path'
import * as Ran from '../../lib/api'
import per from '../permission/permission'
import logger from '../../lib/logger'
import config from '../../config'

Ran.Event.on('login', () => {
  logger('member').info('正在初始化')

  try { fs.mkdirSync(path.join(Ran.Data, '/member')) } catch (error) { }
  if (!fs.existsSync(path.join(Ran.Data, '/member/users.json'))) fs.writeFileSync(path.join(Ran.Data, '/member/users.json'), '{}')
  if (!fs.existsSync(path.join(Ran.Data, '/member/time.json'))) fs.writeFileSync(path.join(Ran.Data, '/member/time.json'), '{}')

  member.load()
  time.load()

  actions.update()

  setInterval(() => actions.update(), 10 * 60 * 1e3)

  logger('member').info('初始化完成')
})

interface Time {
  // 上一次上线的时间
  lastOnline: number,
  // 上一次发工资到现在的在线时长
  Time: number,
  // 在线状态
  online: boolean
}

// 工具类
const utils = {
  filter: (input: string): string => {
    let output = input

    output = output.replace(/\[/g, '')
    output = output.replace(/\]/g, '')
    output = output.replace(/@/g, '')
    output = output.replace(/\s+/g, '')
    output = output.replace(/\//g, '')
    output = output.replace(/\\/g, '')
    output = output.replace(/\./g, '')

    return output
  }
}

// 用户管理
const member: {
  users: {
    [index: string]: number
  },
  path: string,
  write(): void,
  load(): void,
  set(uid: string, money: number): string,
  add(uid: string, money: number): string,
  remove(uid: string): string
} = {
  path: path.join(Ran.Data, '/member/users.json'),
  users: {},
  // 写入数据
  write: () => fs.writeFileSync(member.path, JSON.stringify(member.users)),
  // 读取数据
  load: () => (member.users = JSON.parse(fs.readFileSync(member.path).toString())),
  // 添加员工
  add: (uid: string, money: number) => {
    const realUid = utils.filter(uid)
    if (member.users[realUid]) return '已经添加过这个员工了'
    member.users[realUid] = money
    member.write()
    return '添加成功'
  },
  // 删除员工
  remove: (uid: string) => {
    const realUid = utils.filter(uid)
    if (member.users[realUid] === undefined) return '你还没有添加这个员工'
    delete member.users[realUid]
    member.write()
    return '删除成功'
  },
  // 设置金额
  set: (uid: string, money: number) => {
    const realUid = utils.filter(uid)
    if (member.users[realUid] === undefined) return '你还没有添加这个员工'
    member.users[realUid] = money
    member.write()
    return '设置成功'
  }
}

// 记录时间
const time: {
  users: {
    [index: string]: Time
  },
  path: string,
  write(): void,
  load(): void,
  clear(): void,
  onOnline(uid: string): void
  onOffline(uid: string): void
} = {
  path: path.join(Ran.Data, '/member/time.json'),
  users: {},
  // 写入数据
  write: () => fs.writeFileSync(time.path, JSON.stringify(time.users)),
  // 读取数据
  load: () => (time.users = JSON.parse(fs.readFileSync(time.path).toString())),
  // 清空数据
  clear: () => {
    time.users = {}
    time.write()
  },
  onOnline: (uid: string) => {
    if (time.users[uid] && time.users[uid].online) return
    if (!time.users[uid]) {
      time.users[uid] = {
        online: true,
        lastOnline: new Date().getTime(),
        Time: 0
      }
    } else {
      time.users[uid].lastOnline = new Date().getTime()
      time.users[uid].online = true
    }

    time.write()
  },
  onOffline: (uid: string) => {
    if (time.users[uid]) {
      const t: number = new Date().getTime() - time.users[uid].lastOnline
      time.users[uid].Time += t
      time.users[uid].online = false

      time.write()
    }
  }
}

// 一些操作
const actions = {
  // 发工资
  payment: () => {
    for (const uid of Object.keys(time.users)) {
      const t = time.users[uid]
      const hours = t.Time / 1e3 / 60 / 60
      const money = member.users[uid] * hours
      logger('Member').info(`正在向 ${uid} 发工资...(在线时长: ${hours}小时, 工资: ${money})`)
      Ran.method.payment(uid, money, `在线时长: ${hours}小时\n工资: ${money}`)
    }

    time.clear()
  },
  // 更新在线状态
  update: async () => {
    if (member.users === {}) {
      logger('member').info('没有员工，跳过数据更新')
      return
    }

    const list = await Ran.method.utils.getUserList()

    const mark: {
      [index: string]: boolean
    } = {}

    for (const uid of Object.keys(member.users)) {
      mark[uid] = false
    }

    for (const user of list) {
      if (member.users[user.uid]) {
        mark[user.uid] = true
        time.onOnline(user.uid)
      }
    }

    Object.keys(mark).forEach(uid => {
      if (!mark[uid]) time.onOffline(uid)
    })
  }
}

Ran.Event.on('JoinRoom', msg => {
  if (member.users[msg.uid]) time.onOnline(msg.uid)
})

Ran.Event.on('SwitchRoom', msg => {
  if (member.users[msg.uid]) time.onOffline(msg.uid)
})

Ran.Event.on('LeaveRoom', msg => {
  if (member.users[msg.uid]) time.onOffline(msg.uid)
})

Ran.command(/^\.增加员工(.*)$/, 'member.add', (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'member.add') && !per.users.hasPermission(e.uid, 'permission.member.add')) return reply('[!] 权限不足', 'CB3837')
  const uid = utils.filter(m[1])
  try {
    reply(member.add(uid, 1))
  } catch (error) {
    logger('member').error('fs error', error)
    reply('[!] 文件写入失败，数据将会在下次重启后丢失', 'CB3837')
  }
})

Ran.command(/^\.删除员工(.*)$/, 'member.remove', (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'member.remove') && !per.users.hasPermission(e.uid, 'permission.member.remove')) return reply('[!] 权限不足', 'CB3837')
  const uid = utils.filter(m[1])
  try {
    reply(member.remove(uid))
  } catch (error) {
    logger('member').error('fs error', error)
    reply('[!] 文件写入失败，数据将会在下次重启后丢失', 'CB3837')
  }
})

Ran.command(/^\.设置工资(.*)(\d+)$/, 'member.set', (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'member.set') && !per.users.hasPermission(e.uid, 'permission.member.set')) return reply('[!] 权限不足', 'CB3837')
  const uid = utils.filter(m[1])
  const money = Number(m[2])

  if (money < 0.1 || money > 2.5) return reply('[!] 工资必须大于 0.1 且小于 2.5', 'CB3837')

  try {
    reply(member.set(uid, money))
  } catch (error) {
    logger('member').error('fs error', error)
    reply('[!] 文件写入失败，数据将会在下次重启后丢失', 'CB3837')
  }
})

Ran.command(/^\.查询员工$/, 'member.query', (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'member.query') && !per.users.hasPermission(e.uid, 'permission.member.query')) return reply('[!] 权限不足', 'CB3837')
  const msg = []

  for (const uid of Object.keys(member.users)) {
    const online = time.users[uid] ? time.users[uid].Time : 0

    msg.push(` [@${uid}@]  . ${online / 1e3 / 60 / 60}小时`)
  }

  reply(msg.join('\n'))
})

Ran.command(/^\.结算$/, 'member.payment', async (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'member.payment') && !per.users.hasPermission(e.uid, 'permission.member.payment')) return reply('[!] 权限不足', 'CB3837')
  let total = 0
  for (const uid of Object.keys(time.users)) {
    const t = time.users[uid]
    const hours = t.Time / 1e3 / 60 / 60
    const money = member.users[uid] * hours
    total += money
  }

  const selfInfo = await Ran.method.utils.getUserProfile(config.account.username)

  if (Number(selfInfo.money.hold) < total) {
    reply('[!] 机器人余额不足', 'CB3837')
  } else {
    actions.payment()
  }
})
