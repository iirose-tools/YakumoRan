import fs from 'fs'
import config from '../../config'
import path from 'path'
import * as Ran from '../../lib/api'
import per from '../permission/permission'

const init = () => {
  try {
    fs.mkdirSync(path.join(Ran.Data, './member/memberworktime'))
  } catch (error) {}
  try {
    setInterval(updateminutes, 60000) // 1分钟更新一次Member在线时间（分钟）
    setInterval(updateMemberStatus, 900000) // 15分钟更新一次用户在线状态
  } catch (error) {}
}

const filter = (input: string) => {
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

// 更新用户在线状态
const updateMemberStatus = () => {
  const promise = Ran.method.utils.getUserList()
  promise.then((res) => {
    const uid = checkMemberList()
    const allonlineuser = res
    let a = 0
    do {
      let b = 0
      do {
        if (uid[a] === allonlineuser[b].uid.toLocaleUpperCase()) {
          if (allonlineuser[b].room === config.account.room) {
            onJoin(allonlineuser[b].uid)
          } else {
            onLeave(allonlineuser[b].uid)
          }
          b = allonlineuser.length
        } else {
          onLeave(uid[a])
          b = b + 1
        }
      } while (b < allonlineuser.length)
      a = a + 1
    } while (a < uid.length)
  })
}

// 登记Member
const addMember = (Uid: string) => {
  const uid = Uid.toUpperCase()
  const Member = path.join(Ran.Data, `./member/memberworktime/${uid}.json`)
  if (!fs.existsSync(Member)) {
    fs.writeFileSync(Member, '{"Minutes":0,"Online":0}')
  } else {
    throw new Error('员工已经存在')
  }
}

// 当Member离开
const onLeave = (uid: string) => {
  try {
    const info = getMemberInfo(uid)
    info.Online = 0
    update(uid, info)
  } catch (error) {}
}
// 当Member加入
const onJoin = (uid: string) => {
  try {
    const info = getMemberInfo(uid)
    info.Online = 1
    update(uid, info)
  } catch (error) {}
}
// 更新Member在线时间累计
const updateminutes = () => {
  const memberlist = checkMemberList()
  const timezone = 8 // 目标时区时间，东八区   东时区正数 西市区负数
  const offsetGMT = new Date().getTimezoneOffset() // 本地时间和格林威治的时间差，单位为分钟
  const nowDate = new Date().getTime() // 本地时间距 1970 年 1 月 1 日午夜（GMT 时间）之间的毫秒数
  const targetDate = new Date(nowDate + offsetGMT * 60 * 1000 + timezone * 60 * 60 * 1000)
  const hour = targetDate.getHours()
  const minuses = targetDate.getMinutes()
  if (hour === 3) {
    if (minuses < 3) {
      let a = 0
      try {
        do {
          const info = getMemberInfo(memberlist[a])
          info.Minutes = 0
          update(memberlist[a], info)
          a = a + 1
        } while (a < memberlist.length)
      } catch (error) {
      }
    }
  } else {
    let a = 0
    try {
      do {
        const info = getMemberInfo(memberlist[a])
        if (info.Online === 1) {
          info.Minutes = info.Minutes + 1
          update(memberlist[a], info)
        }
        a = a + 1
      } while (a < memberlist.length)
    } catch (error) {
    }
  }
}

// 更新json文件
const update = (uid:string, data:any) => {
  const file = path.join(Ran.Data, `./member/memberworktime/${uid}.json`)
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 3))
  } catch (error) {
    Ran.method.sendPublicMessage(`[Member] 错误: ${error.message}`, config.app.color)
  }
}
// 获取Member的UID
const checkMemberList = () => {
  const file = path.join(Ran.Data, './member/memberworktime')
  return fs.readdirSync(file).map(e => e.replace('.json', ''))
}
// 获取Member的信息
const getMemberInfo = (uid:string) => {
  const file = path.join(Ran.Data, `./member/memberworktime/${uid}.json`)
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file).toString())
  } else {
    throw new Error('File Not Exists')
  }
}

// 删除Member
const deleteMember = (uid: String) => {
  const file = path.join(Ran.Data, `./member/memberworktime/${uid}.json`)
  if (!fs.existsSync(file)) throw new Error('用户不存在')

  fs.unlinkSync(file)
}

// 获取员工在线时长
const settle = () => {
  const memberlist = checkMemberList()
  let a = 0
  try {
    do {
      const info = getMemberInfo(memberlist[a])
      const hour = info.Minutes / 60 >> 0
      const minutes = info.Minutes % 60
      Ran.method.sendPublicMessage(`${a}. [@${memberlist[a]}@] : ${hour}小时 ${minutes}分钟`, config.app.color)
      a = a + 1
    } while (a < memberlist.length)
  } catch (error) {
  }
}

Ran.command(/^\.增加员工(.*)$/, 'permission.member.add', (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member')) {
    reply(` [*${e.username}*]   :  没有权限`, config.app.color)
    return null
  }
  if (filter(m[1]).length === 13) {
    try {
      addMember(filter(m[1]).toString())
      reply('[Member] 添加员工成功')
    } catch (error) {
      reply(`[Member] 添加员工失败: ${error.message}`)
    }
  } else {
    reply('错误的UID')
  }
})

Ran.command(/^\.查询员工(.*)$/, 'permission.member.check', (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member')) {
    reply(` [*${e.username}*]   :  没有权限`, config.app.color)
    return null
  }
  try {
    reply([
      ...checkMemberList().map((v, i) => {
        return `${i}. [@${v}@] `
      })
    ].join('\n'), config.app.color)
  } catch (error) {
    reply(`[Member] 查询员工失败: ${error.message}`)
  }
})

Ran.command(/^\.结算(.*)$/, 'permission.member.settle', (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member')) {
    reply(` [*${e.username}*]   :  没有权限`, config.app.color)
    return null
  }
  try {
    settle()
  } catch (error) {
    reply(`[Member] 结算失败: ${error.message}`)
  }
})

Ran.command(/^\.删除员工(.*)$/, 'permission.member.del', (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member')) {
    reply(` [*${e.username}*]   :  没有权限`, config.app.color)
    return null
  }
  if (filter(m[1]).length === 13) {
    try {
      deleteMember(filter(m[1]).toString())
      reply('[Member] 删除员工成功')
    } catch (error) {
      reply(`[Member] 删除员工失败: ${error.message}`)
    }
  } else {
    reply('错误的UID')
  }
})

Ran.Event.on('JoinRoom', (msg) => {
  onJoin(msg.uid)
})

Ran.Event.on('LeaveRoom', (msg) => {
  onLeave(msg.uid)
})

Ran.Event.on('SwitchRoom', (msg) => {
  onLeave(msg.uid)
})

Ran.Event.on('login', () => {
  updateMemberStatus()
})

init()
