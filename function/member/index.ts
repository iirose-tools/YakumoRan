import fs from 'fs'
import path from 'path'
import * as Ran from '../../lib/api'
import per from '../permission/permission'
import logger from '../../lib/logger'
import config from '../../config'

import { Member } from './Member'
import { utils } from './utils'
import { Actions, autopayAction } from './Action'
import { autopay } from './Autopay'

/**
 * 初始化
 */
Ran.Event.on('login', () => {
  logger('member').info('正在初始化')

  try { fs.mkdirSync(path.join(Ran.Data, '/member')) } catch (error) { }
  if (!fs.existsSync(path.join(Ran.Data, '/member/members.json'))) fs.writeFileSync(path.join(Ran.Data, '/member/members.json'), '{}')
  if (!fs.existsSync(path.join(Ran.Data, '/member/option.json'))) fs.writeFileSync(path.join(Ran.Data, '/member/option.json'), '{}')
  Member.load()
  autopay.load()
  event.Room()
  command.memberCommand()
  command.autopayOptionCommand()
  Actions.update()
  autopayAction.startAutopayOperation()
  setInterval(() => Member.addminutes(), 1 * 60 * 1e3)
  setInterval(() => Actions.update(), 15 * 60 * 1e3)
  logger('member').info('初始化完成')
})

const event = {
  Room: () => {
    Ran.Event.on('JoinRoom', msg => {
      if (Member.users[msg.uid.toLocaleLowerCase()]) Member.onOnline(msg.uid)
    })
    Ran.Event.on('SwitchRoom', msg => {
      if (Member.users[msg.uid.toLocaleLowerCase()]) Member.onOffline(msg.uid)
    })
    Ran.Event.on('LeaveRoom', msg => {
      if (Member.users[msg.uid.toLocaleLowerCase()]) Member.onOffline(msg.uid)
    })
  }
}

const command = {
  memberCommand: () => {
    Ran.command(/^\.增加员工(.*)$/, 'member.add', (m, e, reply) => {
      if (!per.users.hasPermission(e.uid, 'member.add') && !per.users.hasPermission(e.uid, 'permission.member.add')) return reply('[!] 权限不足', 'CB3837')
      try {
        const uid = utils.filter(m[1])
        if (utils.UidLengthControl(uid) === false) return reply('[Member] 添加员工失败，UID错误')
        reply(Member.add(uid))
      } catch (error) {
        logger('member').error('fs error', error)
      }
    })
    Ran.command(/^\.删除员工(.*)$/, 'member.remove', (m, e, reply) => {
      if (!per.users.hasPermission(e.uid, 'member.remove') && !per.users.hasPermission(e.uid, 'permission.member.remove')) return reply('[!] 权限不足', 'CB3837')
      try {
        const uid = utils.filter(m[1])
        if (utils.UidLengthControl(uid) === false) return reply('[Member] 删除员工失败，UID错误')
        reply(Member.remove(uid))
      } catch (error) {
        logger('member').error('fs error', error)
        reply('[!] 文件写入失败，数据将会在下次重启后丢失', 'CB3837')
      }
    })
    Ran.command(/^\.查询员工$/, 'member.query', (m, e, reply) => {
      if (!per.users.hasPermission(e.uid, 'member.query') && !per.users.hasPermission(e.uid, 'permission.member.query')) return reply('[!] 权限不足', 'CB3837')
      const msg = []
      let a = 1
      for (const uid of Object.keys(Member.users)) {
        msg.push(`${a}. [@${uid}@] `)
        a = a + 1
      }
      if (msg.length === 0) {
        reply('[Member] 没有员工')
      } else {
        reply(msg.join('\n'))
      }
    })
    Ran.command(/^\.结算$/, 'member.payment', async (m, e, reply) => {
      if (!per.users.hasPermission(e.uid, 'member.query') && !per.users.hasPermission(e.uid, 'permission.member.query')) return reply('[!] 权限不足', 'CB3837')
      const msg = []
      let a = 1
      for (const uid of Object.keys(Member.users)) {
        const time = utils.calHourNMinutes(Member.users[uid].Minutes)
        msg.push(`${a}. [@${uid}@]  : ${time[0]}小时 ${time[1]}分钟`)
        a = a + 1
      }
      if (msg.length === 0) {
        reply('[Member] 没有员工')
      } else {
        reply(msg.join('\n'))
      }
    })
  },
  autopayOptionCommand: () => {
    Ran.command(/^\.设置自发工资 (.*) (.*)$/, 'permission.member.setautopay', (m, e, reply) => {
      if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member')) {
        reply(` [*${e.username}*]   :  没有权限`, config.app.color)
        return null
      }
      try {
        const uid: string = utils.filter(m[1])
        if (isNaN(+m[2])) return reply('[Member] 自动付工资设置失败，工资必须是数字')
        const sal: number = +m[2]
        if (utils.UidLengthControl(uid) === false) return reply('[Member] 自动付工资设置失败，UID错误')
        if (utils.saleryControl(sal) === false) return reply('工资必须大于"0.09" 或者小于"3.1"')
        reply(autopay.set(uid, +sal))
      } catch (error) {
        logger('member').error('fs error', error)
      }
    })
    Ran.command(/^\.开自发工资$/, 'permission.member.openautopay', (m, e, reply) => {
      if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member')) {
        reply(` [*${e.username}*]   :  没有权限`, config.app.color)
        return null
      }
      try {
        reply(autopay.open())
      } catch (error) {
        logger('member').error('fs error', error)
      }
    })
    Ran.command(/^\.关自发工资$/, 'permission.member.stopautopay', (m, e, reply) => {
      if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member')) {
        reply(` [*${e.username}*]   :  没有权限`, config.app.color)
        return null
      }
      try {
        reply(autopay.close())
      } catch (error) {
        logger('member').error('fs error', error)
      }
    })
  }
}
