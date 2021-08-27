import * as Ran from '../../lib/api'
import config from '../../config'
import api from './permission'

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

Ran.command(/^\.p group create (.*)$/, 'permission.group.create', (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.group.create')) return reply('权限不足', config.app.color)
    api.group.create(filter(m[1]))
    reply('[Permission] 权限组创建成功', config.app.color)
  } catch (error) {
    reply('[Permission] 权限组创建失败', config.app.color)
  }
})

Ran.command(/^\.p group del (.*)$/, 'permission.group.delete', (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.group.delete')) return reply('权限不足', config.app.color)
    api.group.delete(filter(m[1]))
    reply('[Permission] 权限组删除成功', config.app.color)
  } catch (error) {
    reply('[Permission] 权限组删除失败', config.app.color)
  }
})

Ran.command(/^\.p group list$/, 'permission.group.list', (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.group.list')) return reply('权限不足', config.app.color)
    reply([
      ...api.group.list().map((v, i) => {
        return `${i}. ${v}`
      })
    ].join('\n'), config.app.color)
  } catch (error) {
    reply('[Permission] 权限组读取失败', config.app.color)
  }
})

Ran.command(/^\.p group info (.*)$/, 'permission.group.info', (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.group.info')) return reply('权限不足', config.app.color)
    const group = filter(m[1])
    const g = api.group.getGroup(group)
    const msg = [
      '=========权限=========',
      ...g.permission
    ]
    reply(msg.join('\n'), config.app.color)
  } catch (error) {
    reply('[Permission] 权限添加失败', config.app.color)
  }
})

Ran.command(/^\.p group add (.*) (.*)$/, 'permission.group.add', (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.group.add')) return reply('权限不足', config.app.color)
    const group = filter(m[1])
    const permission = m[2]
    api.group.addPermission(group, permission)
    reply('[Permission] 权限添加成功', config.app.color)
  } catch (error) {
    reply('[Permission] 权限添加失败', config.app.color)
  }
})

Ran.command(/^\.p group rm (.*) (.*)$/, 'permission.group.remove', (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.group.remove')) return reply('权限不足', config.app.color)
    const group = filter(m[1])
    const permission = m[2]
    api.group.removePermission(group, permission)
    reply('[Permission] 权限删除成功', config.app.color)
  } catch (error) {
    reply('[Permission] 权限删除失败', config.app.color)
  }
})

Ran.command(/^\.p group has (.*) (.*)$/, 'permission.group.has', (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.group.has')) return reply('权限不足', config.app.color)
    const group = filter(m[1])
    const permission = m[2]
    const result = api.group.hasPermission(group, permission)
    reply(`[Permission] 权限组 ${group} ${result ? '拥有' : '没有'} ${permission} 权限`, config.app.color)
  } catch (error) {
    reply('[Permission] 权限组读取失败', config.app.color)
  }
})

Ran.command(/^\.p user create (.*)$/, 'permission.user.create', (m, e, reply) => {
  try {
    const uid = filter(m[1])
    if (!api.users.hasPermission(e.uid, 'permission.user.create')) return reply('权限不足', config.app.color)
    api.users.create(uid)
    reply('[Permission] 用户创建成功', config.app.color)
  } catch (error) {
    reply('[Permission] 用户创建失败', config.app.color)
  }
})

Ran.command(/^\.p user del (.*)$/, 'permission.user.delete', (m, e, reply) => {
  try {
    const uid = filter(m[1])
    if (!api.users.hasPermission(e.uid, 'permission.user.delete')) return reply('权限不足', config.app.color)
    api.users.delete(uid)
    reply('[Permission] 用户删除成功', config.app.color)
  } catch (error) {
    reply('[Permission] 用户删除失败', config.app.color)
  }
})

Ran.command(/^\.p user list$/, 'permission.user.list', (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.user.list')) return reply('权限不足', config.app.color)
    reply([
      ...api.users.list().map((v, i) => {
        return `${i}. [@${v}@] `
      })
    ].join('\n'), config.app.color)
  } catch (error) {
    reply('[Permission] 用户读取失败', config.app.color)
  }
})

Ran.command(/^\.p user list (.*)$/, 'permission.user.plist', (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.user.plist')) return reply('权限不足', config.app.color)
    reply([
      ...api.users.has(m[1]).map((v, i) => {
        return `${i}. [@${v}@] `
      })
    ].join('\n'), config.app.color)
  } catch (error) {
    reply('[Permission] 用户读取失败', config.app.color)
  }
})

Ran.command(/^\.p user info (.*)$/, 'permission.user.info', (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.user.info')) return reply('权限不足', config.app.color)
    const uid = filter(m[1])
    const u = api.users.getUser(uid)
    const msg = [
      '=========权限=========',
      ...u.permission,
      '========权限组========',
      ...u.group
    ]
    reply(msg.join('\n'), config.app.color)
  } catch (error) {
    reply('[Permission] 权限添加失败', config.app.color)
  }
})

Ran.command(/^\.p user add (.*) (.*)$/, 'permission.user.add', (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.user.add')) return reply('权限不足', config.app.color)
    const uid = filter(m[1])
    const permission = m[2]
    api.users.addPermission(uid, permission)
    reply('[Permission] 权限添加成功', config.app.color)
  } catch (error) {
    reply('[Permission] 权限添加失败', config.app.color)
  }
})

Ran.command(/^\.p user rm (.*) (.*)$/, 'permission.user.remove', (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.user.remove')) return reply('权限不足', config.app.color)
    const uid = filter(m[1])
    const permission = m[2]
    api.users.removePermission(uid, permission)
    reply('[Permission] 权限删除成功', config.app.color)
  } catch (error) {
    reply('[Permission] 权限删除失败', config.app.color)
  }
})

Ran.command(/^\.p user join (.*) (.*)$/, 'permission.user.join', (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.user.join')) return reply('权限不足', config.app.color)
    const uid = filter(m[1])
    const group = m[2]
    api.users.addToGroup(uid, group)
    reply('[Permission] 权限添加成功', config.app.color)
  } catch (error) {
    reply('[Permission] 权限添加失败', config.app.color)
  }
})

Ran.command(/^\.p user has (.*) (.*)$/, 'permission.user.has', (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.user.has')) return reply('权限不足', config.app.color)
    const uid = filter(m[1])
    const permission = m[2]
    const result = api.users.hasPermission(uid, permission)
    reply(`[Permission] 用户  [@${uid}@]  ${result ? '拥有' : '没有'} ${permission} 权限`, config.app.color)
  } catch (error) {
    reply('[Permission] 用户读取失败', config.app.color)
  }
})

Ran.command(/^\.p me has (.*)$/, 'permission.me.has', (m, e, reply) => {
  try {
    const permission = m[1]
    const result = api.users.hasPermission(e.uid, permission)
    reply(`[Permission] 用户  [@${e.uid}@]  ${result ? '拥有' : '没有'} ${permission} 权限`, config.app.color)
  } catch (error) {
    reply('[Permission] 用户读取失败', config.app.color)
  }
})
