import fs from 'fs'
import path from 'path'
import * as Ran from '../../lib/api'
import per from '../permission/permission'
import logger from '../../lib/logger'

import { Member } from './Member'
import { utils } from './utils'
import { Actions, autopayAction } from './Action'
import { autopay } from './Autopay'

const start = () => {
  logger('member').info('正在初始化')
  try { fs.mkdirSync(path.join(Ran.Data, '/member')) } catch (error) { }
  if (!fs.existsSync(path.join(Ran.Data, '/member/members.json'))) fs.writeFileSync(path.join(Ran.Data, '/member/members.json'), '{}')
  if (!fs.existsSync(path.join(Ran.Data, '/member/option.json'))) fs.writeFileSync(path.join(Ran.Data, '/member/option.json'), '{}')
  try {
    Member.load()
    autopay.load()
    Actions.update()
    autopayAction.startAutopayOperation()
    command.memberCommand()
    command.autopayOptionCommand()
    event.room()
    setInterval(() => Member.addminutes(), 1 * 60 * 1e3)
    setInterval(() => Actions.update(), 15 * 60 * 1e3)
  } catch (error) {
    logger('member').error('fs error', error)
  }
  if (fs.existsSync(path.join(Ran.Data, '/member/users.json'))) {
    logger('member').info('发现老版本数据...')
    try {
      const oldData = JSON.parse(fs.readFileSync(path.join(Ran.Data, '/member/users.json')).toString())
      for (const uid of Object.keys(oldData)) {
        Member.add(uid)
        autopay.set(uid, oldData[uid])
      }

      fs.copyFileSync(path.join(Ran.Data, '/member/users.json'), path.join(Ran.Data, '/member/users.old.json'))
      fs.copyFileSync(path.join(Ran.Data, '/member/time.json'), path.join(Ran.Data, '/member/time.old.json'))

      fs.unlinkSync(path.join(Ran.Data, '/member/users.json'))
      fs.unlinkSync(path.join(Ran.Data, '/member/time.json'))

      logger('member').info('数据导入完成!')
    } catch (error) {
      logger('member').error('数据导入失败', error)
    }
    logger('member').info('初始化完成')
  }
}

// 初始化
Ran.Event.on('login', () => {
  Actions.update()
})

const event = {
  room: () => {
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
      if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member.add')) return reply(`[!]  [*${e.username}*]  权限不足`, 'CB3837')
      try {
        const uid = utils.filter(m[1])
        if (utils.UidLengthControl(uid) === false) return reply('[Member] 添加员工失败，UID错误')
        reply(Member.add(uid))
      } catch (error) {
        logger('member').error('fs error', error)
      }
    })

    Ran.command(/^\.删除员工(.*)$/, 'member.remove', (m, e, reply) => {
      if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member.remove')) return reply(`[!]  [*${e.username}*]  权限不足`, 'CB3837')
      try {
        const uid = utils.filter(m[1])
        if (utils.UidLengthControl(uid) === false) return reply('[Member] 删除员工失败，UID错误')
        reply(Member.remove(uid))
      } catch (error) {
        logger('member').error('fs error', error)
        reply('[!] 文件写入失败，数据将会在下次重启后丢失', 'FF4D4F')
      }
    })

    Ran.command(/^\.查询员工$/, 'member.query', (m, e, reply) => {
      if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member.query')) return reply(`[!]  [*${e.username}*]  权限不足`, 'CB3837')
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
      if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member.query')) return reply(`[!]  [*${e.username}*]  权限不足`, 'CB3837')
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
    Ran.command(/^\.初始化自发工资 (.*) (.*)$/, 'member.setautopay', (m, e, reply) => {
      if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member')) return reply(`[!]  [*${e.username}*]  权限不足`, 'CB3837')
      try {
        const uid: string = utils.filter(m[1])
        if (isNaN(+m[2])) return reply('[Member] 自动付工资设置失败，工资必须是数字')
        const sal: number = +m[2]
        if (utils.UidLengthControl(uid) === false) return reply('[Member] 自动付工资设置失败，UID错误')
        if (utils.saleryControl(sal) === false) return reply('工资必须大于"0.09" 或者小于"3.1"')
        reply(autopay.set(uid, +sal))
      } catch (error) {
        reply('[!] 设置失败', '#FF4D4F')
        logger('member').error('fs error', error)
      }
    })

    Ran.command(/^\.设置工资(.*)$/, 'member.setsal', (m, e, reply) => {
      if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member')) return reply(`[!]  [*${e.username}*]  权限不足`, 'CB3837')
      try {
        const sal: number = +m[1]
        if (utils.saleryControl(sal) === false) return reply('工资必须大于"0.09" 或者小于"3.1"')
        reply(autopay.setsal(sal))
      } catch (error) {
        reply('[!] 设置失败', '#FF4D4F')
        logger('member').error('fs error', error)
      }
    })

    Ran.command(/^\.设置雇主(.*)$/, 'member.setemployer', (m, e, reply) => {
      if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member')) return reply(`[!]  [*${e.username}*]  权限不足`, 'CB3837')
      try {
        const employer: string = utils.filter(m[1])
        if (utils.UidLengthControl(employer) === false) return reply('[Member] 自动付工资设置失败，UID错误')
        reply(autopay.setemployer(employer))
      } catch (error) {
        reply('[!] 设置失败', '#FF4D4F')
        logger('member').error('fs error', error)
      }
    })

    Ran.command(/^\.开自发工资$/, 'member.openautopay', (m, e, reply) => {
      if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member')) return reply(`[!]  [*${e.username}*]  权限不足`, 'CB3837')
      try {
        reply(autopay.open())
      } catch (error) {
        reply('[!] 设置失败', '#FF4D4F')
        logger('member').error('fs error', error)
      }
    })

    Ran.command(/^\.关自发工资$/, 'member.stopautopay', (m, e, reply) => {
      if (!per.users.hasPermission(e.uid, 'member.op') && !per.users.hasPermission(e.uid, 'permission.member')) return reply(`[!]  [*${e.username}*]  权限不足`, 'CB3837')
      try {
        reply(autopay.close())
      } catch (error) {
        reply('[!] 设置失败', '#FF4D4F')
        logger('member').error('fs error', error)
      }
    })
  }

}
start()
