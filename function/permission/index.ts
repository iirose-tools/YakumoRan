import * as Ran from '../../lib/api'
import config from '../../config'
import api from './permission'

Ran.command(/\.p group create (\S+)/, (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.group.create')) return reply('权限不足', config.app.color)
    api.group.create(m[1])
    reply('[Permission] 权限组创建成功', config.app.color)
  } catch (error) {
    reply(`[Permission] 权限组创建失败: ${error.message}`, config.app.color)
  }
})

Ran.command(/\.p group info (\S+)/, (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.group.info')) return reply('权限不足', config.app.color)
    const group = m[1]
    const g = api.group.getGroup(group)
    const msg = [
      '=========权限=========',
      ...g.permission
    ]
    reply(msg.join('\n'), config.app.color)
  } catch (error) {
    reply(`[Permission] 权限添加失败: ${error.message}`, config.app.color)
  }
})

Ran.command(/\.p group add (\S+) (\S+)/, (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.group.add')) return reply('权限不足', config.app.color)
    const group = m[1]
    const permission = m[2]
    api.group.addPermission(group, permission)
    reply('[Permission] 权限添加成功', config.app.color)
  } catch (error) {
    reply(`[Permission] 权限添加失败: ${error.message}`, config.app.color)
  }
})

Ran.command(/\.p group has (\S+) (\S+)/, (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.group.has')) return reply('权限不足', config.app.color)
    const group = m[1]
    const permission = m[2]
    const result = api.group.hasPermission(group, permission)
    reply(`[Permission] 权限组 ${group} ${result ? '拥有' : '没有'} ${permission} 权限`, config.app.color)
  } catch (error) {
    reply(`[Permission] 权限组读取失败: ${error.message}`, config.app.color)
  }
})

Ran.command(/\.p user create (\S+)/, (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.user.create')) return reply('权限不足', config.app.color)
    api.users.create(m[1])
    reply('[Permission] 用户创建成功', config.app.color)
  } catch (error) {
    reply(`[Permission] 用户创建失败: ${error.message}`, config.app.color)
  }
})

Ran.command(/\.p user info (\S+)/, (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.user.info')) return reply('权限不足', config.app.color)
    const group = m[1]
    const u = api.users.getUser(group)
    const msg = [
      '=========权限=========',
      ...u.permission,
      '========权限组========',
      ...u.group
    ]
    reply(msg.join('\n'), config.app.color)
  } catch (error) {
    reply(`[Permission] 权限添加失败: ${error.message}`, config.app.color)
  }
})

Ran.command(/\.p user add (\S+) (\S+)/, (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.user.add')) return reply('权限不足', config.app.color)
    const uid = m[1]
    const permission = m[2]
    api.users.addPermission(uid, permission)
    reply('[Permission] 权限添加成功', config.app.color)
  } catch (error) {
    reply(`[Permission] 权限添加失败: ${error.message}`, config.app.color)
  }
})

Ran.command(/\.p user join (\S+) (\S+)/, (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.user.join')) return reply('权限不足', config.app.color)
    const uid = m[1]
    const group = m[2]
    api.users.addToGroup(uid, group)
    reply('[Permission] 权限添加成功', config.app.color)
  } catch (error) {
    reply(`[Permission] 权限添加失败: ${error.message}`, config.app.color)
  }
})

Ran.command(/\.p user has (\S+) (\S+)/, (m, e, reply) => {
  try {
    if (!api.users.hasPermission(e.uid, 'permission.user.has')) return reply('权限不足', config.app.color)
    const uid = m[1]
    const permission = m[2]
    const result = api.users.hasPermission(uid, permission)
    reply(`[Permission] 用户  [@${uid}@]  ${result ? '拥有' : '没有'} ${permission} 权限`, config.app.color)
  } catch (error) {
    reply(`[Permission] 用户读取失败: ${error.message}`, config.app.color)
  }
})

Ran.command(/\.p me has (\S+)/, (m, e, reply) => {
  try {
    const permission = m[1]
    const result = api.users.hasPermission(e.uid, permission)
    reply(`[Permission] 用户  [@${e.uid}@]  ${result ? '拥有' : '没有'} ${permission} 权限`, config.app.color)
  } catch (error) {
    reply(`[Permission] 用户读取失败: ${error.message}`, config.app.color)
  }
})
