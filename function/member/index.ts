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
    fs.mkdirSync(path.join(Ran.Data, './member/option'))
  } catch (error) {}
  try {
    setInterval(updateminutes, 60000) // 1分钟更新一次Member在线时间（分钟）
    setInterval(updateMemberStatus, 900000) // 15分钟更新一次用户在线状态
    minutes00()
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

// 获取目前的日期和时间
const getnowtime = () => {
  const timezone = 8 // 目标时区时间，东八区   东时区正数 西市区负数
  const offsetGMT = new Date().getTimezoneOffset() // 本地时间和格林威治的时间差，单位为分钟
  const nowDate = new Date().getTime() // 本地时间距 1970 年 1 月 1 日午夜（GMT 时间）之间的毫秒数
  const targetDate = new Date(nowDate + offsetGMT * 60 * 1000 + timezone * 60 * 60 * 1000)
  return targetDate
}

// 等待到整点+1分钟才执行
const minutes00 = () => {
  const targetDate = getnowtime()
  const minutesleft = 61 - targetDate.getMinutes()
  checkhour()
  setTimeout(autocheckhour, minutesleft * 60000)
}

// 每小时检测
const autocheckhour = () => {
  checkhour()
  setInterval(checkhour, 3600000) // 每小时检查是否到了23点和0点
}

const checkhour = () => {
  try {
    const file = path.join(Ran.Data, './member/option/option.json')
    if (fs.existsSync(file)) {
      const option = getOptionInfo()
      if (option.autopay === 1) {
        const targetDate = getnowtime()
        const hour = targetDate.getHours()
        if (hour === 23) {
          const option = getOptionInfo()
          time2300(option.employer, option.salaryperhour)
        }
        if (hour === 0) {
          const option = getOptionInfo()
          autopaysal(option.employer, option.salaryperhour)
        }
      }
    }
    resetminutes()
  } catch (error) {}
}

// 0点重置所有人的minutes
const resetminutes = () => {
  const memberlist = checkMemberList()
  const targetDate = getnowtime()
  const hour = targetDate.getHours()
  if (hour === 0) {
    let a = 0
    do {
      const info = getMemberInfo(memberlist[a])
      info.Minutes = 0
      update(memberlist[a], info)
      a = a + 1
    } while (a < memberlist.length)
  }
}

// 23:00 会发生的事情
const time2300 = (employer:string, saleryperhour:number) => {
  try {
    const memberlist = checkMemberList()
    let a = 0
    let msg : string = '员工自动记时系统\n晚上 11:00 p.m.\n-------------------------------------\n'
    let allmustpay : number = 0
    do {
      const info = getMemberInfo(memberlist[a])
      const hour = info.Minutes / 60 >> 0
      const minutes = info.Minutes % 60
      let mustpay = hour * saleryperhour
      let predict = mustpay + saleryperhour
      predict = Number(predict.toFixed(2))
      mustpay = Number(mustpay.toFixed(2))
      if (hour === 22) { predict = predict + saleryperhour }
      allmustpay = allmustpay + predict
      allmustpay = Number(allmustpay.toFixed(2))
      msg = msg.concat(`${a}. [@${memberlist[a]}@] \n目前挂机时间: ${hour}小时 ${minutes}分钟\n目前应付工资：${mustpay}钞\n预计应付工资：${predict}钞\n---\n`)
      a = a + 1
    } while (a < memberlist.length)
    const promise = Ran.method.utils.getUserProfile(config.account.username)
    promise.then((res) => {
      const thisrobot = res
      if (Number(thisrobot.money.hold) <= allmustpay) {
        msg = msg.concat(`-------------------------------------\n预计所有应付工资：${allmustpay}钞\n`)
        msg = msg.concat(`机器人拥有的钞：${thisrobot.money.hold}钞\n还需要：${(allmustpay - Number(thisrobot.money.hold)).toFixed(2)}钞\n为了避免失败工资付款失败，请给机器人打：${(allmustpay + 1 - Number(thisrobot.money.hold)).toFixed(2)}钞`)
        Ran.method.sendPrivateMessage(employer, msg, config.app.color)
      }
    })
  } catch (error) {}
}

// 0:00
const autopaysal = (employer:string, saleryperhour:number) => {
  try {
    const memberlist = checkMemberList()
    let allmustpay : number = 0
    let a = 0
    do {
      const info = getMemberInfo(memberlist[a])
      let hour = info.Minutes / 60 >> 0
      if (hour === 23) { hour = hour + 1 }
      let mustpay = hour * saleryperhour
      mustpay = Number(mustpay.toFixed(2))
      allmustpay = allmustpay + mustpay
      allmustpay = Number(allmustpay.toFixed(2))
      a = a + 1
    } while (a < memberlist.length)
    const promise = Ran.method.utils.getUserProfile(config.account.username)
    promise.then((res) => {
      const thisrobot = res
      if (Number(thisrobot.money.hold) <= allmustpay) return Ran.method.sendPrivateMessage(employer, `员工自动记时系统\n凌晨 00:00 a.m.\n-------------------------------------\n钞不足：机器人拥有${thisrobot.money.hold}钞\n今天需要发出的工资：${allmustpay.toFixed(2)}\n请自行发放工资`, config.app.color)
      proceedpaysal(employer, saleryperhour)
    })
  } catch (error) {}
}

const proceedpaysal = (employer:string, saleryperhour:number) => {
  try {
    const memberlist = checkMemberList()
    let msg : string = '员工自动记时系统\n凌晨 00:00 a.m.\n-------------------------------------\n'
    let a = 0
    let allmustpay = 0
    do {
      const info = getMemberInfo(memberlist[a])
      let hour = info.Minutes / 60 >> 0
      if (hour === 23) { hour = hour + 1 }
      let mustpay = hour * saleryperhour
      mustpay = Number(mustpay.toFixed(2))
      allmustpay = allmustpay + mustpay
      allmustpay = Number(allmustpay.toFixed(2))
      msg = msg.concat(`${a}. [@${memberlist[a]}@] \n挂机时长: ${hour}小时\n工资：${mustpay}钞\n---\n`)
      if (hour !== 0) {
        Ran.method.payment(memberlist[a].toLocaleLowerCase(), mustpay, ` [_${config.account.room}_]  ： 工资: ${mustpay}钞\n挂机时长: ${hour}小时`)
      }
      a = a + 1
    } while (a < memberlist.length)
    msg = msg.concat(`-------------------------------------\n工资已发放，总计：${allmustpay.toFixed(2)}钞\n`)
    Ran.method.sendPrivateMessage(employer, msg, config.app.color)
  } catch (error) {}
}

// 更新用户在线状态
const updateMemberStatus = () => {
  try {
    const uid = checkMemberList()
    if (uid.length > 0) {
      const promise = Ran.method.utils.getUserList()
      promise.then((res) => {
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
  } catch (error) {}
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
  try {
    const memberlist = checkMemberList()
    let a = 0
    do {
      const info = getMemberInfo(memberlist[a])
      if (info.Online === 1) {
        info.Minutes = info.Minutes + 1
        update(memberlist[a], info)
      }
      a = a + 1
    } while (a < memberlist.length)
  } catch (error) {}
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
  if (fs.readdirSync(file).length !== 0) {
    return fs.readdirSync(file).map(e => e.replace('.json', ''))
  } else {
    throw new Error('没有员工')
  }
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
// 获取option信息
const getOptionInfo = () => {
  const file = path.join(Ran.Data, './member/option/option.json')
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

// 结算
const settle = () => {
  const memberlist = checkMemberList()
  let a = 0
  let msg : string = ''
  do {
    const info = getMemberInfo(memberlist[a])
    const hour = info.Minutes / 60 >> 0
    const minutes = info.Minutes % 60
    msg = msg.concat(`${a}. [@${memberlist[a]}@] : ${hour}小时 ${minutes}分钟\n`)
    a = a + 1
  } while (a < memberlist.length)
  Ran.method.sendPublicMessage(msg, config.app.color)
}

// 设置option
const setautopayoption = (uid: string, salaryperhour:number) => {
  let msg : string = ''
  const file = path.join(Ran.Data, './member/option/option.json')
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, '{"autopay":0,"employer":0,"salaryperhour":0}')
    }
    const option = getOptionInfo()
    option.autopay = 0
    option.employer = uid
    option.salaryperhour = salaryperhour
    fs.writeFileSync(file, JSON.stringify(option, null, 3))
    msg = msg.concat(`[自动发工资设置成功] 自动发工资：未开启， 雇主： [@${option.employer}@] ， 每小时工资：${option.salaryperhour}`)
    Ran.method.sendPublicMessage(msg, config.app.color)
  } catch (error) {
    Ran.method.sendPublicMessage(`[Member] 错误: ${error.message}`, config.app.color)
  }
}

// 开启自动付工资系统
const openautopay = () => {
  let msg : string = ''
  const file = path.join(Ran.Data, './member/option/option.json')
  try {
    if (!fs.existsSync(file)) return Ran.method.sendPublicMessage("未设置，请运行: .设置自发工资 '雇主UID' '工资'", config.app.color)
    const option = getOptionInfo()
    option.autopay = 1
    fs.writeFileSync(file, JSON.stringify(option, null, 3))
    msg = msg.concat(`[自动发工资设置成功] 自动发工资：开启成功， 雇主： [@${option.employer}@] ， 每小时工资：${option.salaryperhour}`)
    Ran.method.sendPublicMessage(msg, config.app.color)
  } catch (error) {
    Ran.method.sendPublicMessage(`[Member] 错误: ${error.message}`, config.app.color)
  }
}

// 关闭自动付工资系统
const stopautopay = () => {
  let msg : string = ''
  const file = path.join(Ran.Data, './member/option/option.json')
  try {
    if (!fs.existsSync(file)) return Ran.method.sendPublicMessage("未设置，请运行: .设置自发工资 '雇主UID' '工资'", config.app.color)
    const option = getOptionInfo()
    option.autopay = 0
    fs.writeFileSync(file, JSON.stringify(option, null, 3))
    msg = msg.concat('[自动发工资设置成功] 自动发工资：已关闭')
    Ran.method.sendPublicMessage(msg, config.app.color)
  } catch (error) {
    Ran.method.sendPublicMessage(`[Member] 错误: ${error.message}`, config.app.color)
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

Ran.command(/^\.查询员工$/, 'permission.member.check', (m, e, reply) => {
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

Ran.command(/^\.结算$/, 'permission.member.settle', (m, e, reply) => {
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

Ran.command(/^\.设置自发工资 (.*) (.*)$/, 'permission.member.setautopay', (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member')) {
    reply(` [*${e.username}*]   :  没有权限`, config.app.color)
    return null
  }
  try {
    if (filter(m[1]).length === 13) {
      if (!isNaN(+m[2])) {
        if (+m[2] <= 1 && +m[2] >= 0.1) return setautopayoption(filter(m[1]).toString(), +m[2])
        else return reply('工资必须大于"0.09" 或者小于"1.1"')
      } else return reply('工资必须是数字')
    } else return reply('雇主UID错误')
  } catch (error) {
    reply(`[Member] 开启自动发工资失败: ${error.message}`)
  }
})

Ran.command(/^\.开自发工资$/, 'permission.member.openautopay', (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member')) {
    reply(` [*${e.username}*]   :  没有权限`, config.app.color)
    return null
  }
  try {
    openautopay()
  } catch (error) {
    reply(`[Member] 开启自动发工资失败: ${error.message}`)
  }
})

Ran.command(/^\.关自发工资$/, 'permission.member.stopautopay', (m, e, reply) => {
  if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member')) {
    reply(` [*${e.username}*]   :  没有权限`, config.app.color)
    return null
  }
  try {
    stopautopay()
  } catch (error) {
    reply(`[Member] 开启自动发工资失败: ${error.message}`)
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
