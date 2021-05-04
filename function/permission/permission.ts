import config from '../../config'
import * as Ran from '../../lib/api'
import fs from 'fs'
import path from 'path'

interface Permission extends String{}

interface Group {
  permission: Permission[]
}

interface User {
  group: String[],
  permission: Permission[]
}

const conf = {
  master: config.app.master_uid,
  group: path.join(Ran.Data, './permission/group'),
  users: path.join(Ran.Data, './permission/users')
}

const init = () => {
  try { fs.mkdirSync(conf.group) } catch (error) {}
  try { fs.mkdirSync(conf.users) } catch (error) {}

  // 创建默认用户组
  try { api.group.create('default') } catch (error) { }
}

const api = {
  default: {
    /**
     * @description 给默认权限组添加权限
     * @param permission 权限节点
     */
    addPermission: (permission: string) => {
      return api.group.addPermission('default', permission)
    }
  },
  group: {
    /**
     * @description 创建权限组
     * @param name 权限组名字
     */
    create: (name: String) => {
      const file = path.join(conf.group, `${name}.json`)

      if (fs.existsSync(file)) throw new Error('权限组已存在')

      const data = {
        permission: []
      }
      api.group.saveGroup(name, data)
    },
    /**
     * @description 删除权限组
     * @param name 权限组名字
     */
    delete: (name: String) => {
      const file = path.join(conf.group, `${name.toUpperCase()}.json`)
      if (!fs.existsSync(file)) throw new Error('权限组不存在')

      fs.unlinkSync(file)
    },
    /**
     * @description 查看权限组列表
     */
    list: () => {
      return fs.readdirSync(conf.group).map(e => e.replace('.json', ''))
    },
    /**
     * @description 获取权限组信息
     * @param name 权限组名字
     */
    getGroup: (name: String): Group => {
      const file = path.join(conf.group, `${name}.json`)

      if (!fs.existsSync(file)) throw new Error('权限组不存在')

      return JSON.parse(fs.readFileSync(file).toString())
    },
    /**
     * @description 保存权限信息
     * @private
     * @param group 权限组名字
     * @param data 数据
     */
    saveGroup: (group: String, data: Group) => {
      const file = path.join(conf.group, `${group}.json`)
      return fs.writeFileSync(file, JSON.stringify(data))
    },
    /**
     * @description 添加权限
     * @param group 权限组
     * @param permission 权限节点
     */
    addPermission: (group: String, permission: String) => {
      const g = api.group.getGroup(group)
      if (g.permission.includes(permission)) throw new Error('权限已存在')
      g.permission.push(permission)
      return api.group.saveGroup(group, g)
    },
    /**
     * @description 删除权限
     * @param group 权限组
     * @param permission 权限节点
     */
    removePermission: (group: String, permission: String) => {
      const g = api.group.getGroup(group)
      if (!g.permission.includes(permission)) throw new Error('权限不存在')
      g.permission = g.permission.filter(e => {
        if (e === permission) return false
        return true
      })
      return api.group.saveGroup(group, g)
    },
    /**
     * @description 判断权限组是否拥有某个权限
     * @param group 权限组
     * @param permission 权限节点
     */
    hasPermission: (group: String, permission: String) => {
      try {
        const g = api.group.getGroup(group)
        const rp = permission.split('.')
        for (const item of g.permission) {
          const p = item.split('.')
          if (p.length !== rp.length && !item.includes('*')) continue
          let t = true
          for (const i in rp) {
            const index = Number(i)
            const isEnd = (rp.length - 1) === Number(index)
            if (p[index] === '*' && t) return true
            if (rp[index] !== p[index]) t = false
            if (p[index] === rp[index] && isEnd && t) return true
          }
        }
      } catch (error) {
        return false
      }
    }
  },
  users: {
    /**
     * @description 创建用户
     * @param uid uid
     */
    create: (uid: String) => {
      const file = path.join(conf.users, `${uid.toUpperCase()}.json`)

      if (fs.existsSync(file)) throw new Error('用户已存在')

      const data = {
        group: [],
        permission: []
      }
      api.users.saveUser(uid, data)
    },
    /**
     * @description 删除用户
     * @param uid uid
     */
    delete: (uid: String) => {
      const file = path.join(conf.users, `${uid.toUpperCase()}.json`)
      if (!fs.existsSync(file)) throw new Error('用户不存在')

      fs.unlinkSync(file)
    },
    /**
     * @description 查看用户列表
     */
    list: () => {
      return fs.readdirSync(conf.users).map(e => e.replace('.json', ''))
    },
    /**
     * @description 保存权限信息
     * @param user uid
     * @param data 数据
     * @private
     */
    saveUser: (user: String, data: User) => {
      const file = path.join(conf.users, `${user.toUpperCase()}.json`)
      return fs.writeFileSync(file, JSON.stringify(data))
    },
    /**
     * @description 获取用户信息
     * @param uid uid
     */
    getUser: (uid: String): User => {
      const file = path.join(conf.users, `${uid.toUpperCase()}.json`)

      if (conf.master.toUpperCase() === uid.toUpperCase()) {
        if (!fs.existsSync(file)) {
          const p: User = {
            group: [],
            permission: []
          }
          p.permission.push('permission.*')
          p.group.push('default')
          return p
        }
        const p: User = JSON.parse(fs.readFileSync(file).toString())
        if (!p.permission.includes('permission.*')) p.permission.push('permission.*')
        if (!p.group.includes('default')) p.group.push('default')
        return p
      }

      if (!fs.existsSync(file)) {
        const p: User = {
          group: [],
          permission: []
        }
        p.group.push('default')
        return p
      }

      return JSON.parse(fs.readFileSync(file).toString())
    },
    /**
     * @description 添加权限
     * @param user uid
     * @param permission 权限节点
     */
    addPermission: (user: String, permission: String) => {
      const g = api.users.getUser(user)
      if (g.permission.includes(permission)) throw new Error('权限已存在')
      g.permission.push(permission)
      return api.users.saveUser(user, g)
    },
    /**
     * @description 删除权限
     * @param user uid
     * @param permission 权限节点
     */
    removePermission: (user: String, permission: String) => {
      const g = api.users.getUser(user)
      if (!g.permission.includes(permission)) throw new Error('权限不存在')
      g.permission = g.permission.filter(e => {
        if (e === permission) return false
        return true
      })
      return api.users.saveUser(user, g)
    },
    /**
     * @description 添加至用户组
     * @param user uid
     * @param group 权限组名字
     */
    addToGroup: (user: String, group: String) => {
      const g = api.users.getUser(user)
      if (g.group.includes(group)) throw new Error('权限组已存在')
      g.group.push(group)
      return api.users.saveUser(user, g)
    },
    /**
     * @description 查看拥有指定权限的人
     * @param permission 权限节点
     */
    has: (permission: String): String[] => {
      const list = api.users.list()
      const plist: String[] = []
      for (const user of list) {
        if (api.users.hasPermission(user, permission)) plist.push(user)
      }
      return plist
    },
    /**
     * @description 判断是否拥有某个权限
     * @param uid uid
     * @param permission 权限节点
     */
    hasPermission: (uid: String, permission: String) => {
      const user = api.users.getUser(uid)

      // 先判断用户自己有没有这个权限
      const rp = permission.split('.')
      for (const item of user.permission) {
        const p = item.split('.')
        if (p.length !== rp.length && !item.includes('*')) continue
        let t = true
        for (const i in rp) {
          const index = Number(i)
          const isEnd = (rp.length - 1) === Number(index)
          if (p[index] === '*' && t) return true
          if (rp[index] !== p[index]) t = false
          if (p[index] === rp[index] && isEnd && t) return true
        }
      }

      // 然后判断权限组里面有没有这个权限
      for (const group of user.group) {
        const p = api.group.hasPermission(group, permission)
        if (p) return p
      }
    }
  }
}

export default api

init()
