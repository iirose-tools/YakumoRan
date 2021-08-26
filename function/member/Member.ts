import * as Ran from '../../lib/api'
import path from 'path'
import fs from 'fs'
import { utils } from './utils'
import { Actions } from './Action'

/**
 * @description Member
 * @class
 */
export class Member {
  static path = path.join(Ran.Data, '/member/members.json');
  static users: {
    [index: string]: {
      online: boolean,
      Minutes: number
    }
  } = {};

  /**
   * @description 写入数据
   */
  static write () {
    return fs.writeFileSync(this.path, JSON.stringify(this.users))
  }

  /**
   * @description 读取数据
   */
  static load () {
    return (this.users = JSON.parse(fs.readFileSync(this.path).toString()))
  }

  /**
   * @description 添加员工
   */
  static add (uid: string) {
    const realUid = utils.filter(uid.toLocaleLowerCase())
    if (this.users[realUid]) return '已经添加过这个员工了'
    this.users[realUid] = {
      Minutes: 0,
      online: false
    }
    this.write()
    return '[Member] 添加成功'
  }

  /**
   * @description 删除员工
   */
  static remove (uid: string) {
    const realUid = utils.filter(uid.toLocaleLowerCase())
    if (this.users[realUid] === undefined) return '你还没有添加这个员工'
    delete this.users[realUid]
    this.write()
    return '删除成功'
  }

  /**
   * @description 当触发用户在线
   */
  static onOnline (uid: string) {
    uid = uid.toLocaleLowerCase()
    if (this.users[uid]) {
      this.users[uid].online = true
      this.write()
    }
  }

  /**
   * @description 当触发用户不在线
   */
  static onOffline (uid: string) {
    uid = uid.toLocaleLowerCase()
    if (this.users[uid]) {
      this.users[uid].online = false
      this.write()
    }
  }

  /**
   * @description 增加分钟
   */
  static addminutes () {
    if (Object.keys(this.users).length === 0) return
    for (const uid of Object.keys(this.users)) {
      if (Actions.checkOnline(uid)) {
        this.users[uid].Minutes = this.users[uid].Minutes + 1
        this.write()
      }
    }
  }

  /**
   * @description 重置分钟
   */
  static resetminutes () {
    if (Object.keys(this.users).length === 0) return
    for (const uid of Object.keys(this.users)) {
      this.users[uid].Minutes = 0
      this.write()
    }
  }
}
