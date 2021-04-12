import path from 'path'
import { mkdirSync } from 'fs'
import logger from '../logger'
import { Bot } from '../event'
import { send } from '../websocket'
import damaku from '../encoder/messages/damaku'
import Like from '../encoder/system/Like'
import payment from '../encoder/system/payment'
import PrivateMessage from '../encoder/messages/PrivateMessage'
import PublicMessage from '../encoder/messages/PublicMessage'
import { PublicMessage as typePublicMessage } from '../decoder/PublicMessage'
import config from '../../config'
import mediaCard from '../encoder/messages/media_card'
import mediaData from '../encoder/messages/media_data'
import status from '../core/status'
import blackList from '../encoder/admin/blackList'
import kick from '../encoder/admin/kick'
import mediaClear from '../encoder/admin/media_clear'
import mediaCut from '../encoder/admin/media_cut'
import mediaExchange from '../encoder/admin/media_exchange'
import mediaGoto from '../encoder/admin/media_goto'
import mediaOperation from '../encoder/admin/media_operation'
import mute from '../encoder/admin/mute'
import notice from '../encoder/admin/notice'
import setMaxUser from '../encoder/admin/setMaxUser'
import whiteList from '../encoder/admin/whiteList'
import GetUserList from '../encoder/system/GetUserList'
import UserProfile from '../encoder/user/UserProfile'
import { moveTo } from '../core'
import bank from '../encoder/system/bank'

export const Event = Bot

export const command = (regexp: RegExp, callback: (m: RegExpExecArray, e: typePublicMessage, reply: (message: string, color: string) => void) => void) => {
  logger('Command').debug(`开始注册 ${regexp} 命令`)
  Bot.on('PublicMessage', e => {
    if (e.username === config.account.username) return

    regexp.lastIndex = 0
    if (regexp.test(e.message)) {
      status('command')
      logger('Command').info(`${e.username} 触发了 ${regexp} 命令: ${e.message}`)

      const reply = (msg: string, color: string) => {
        return method.sendPublicMessage(msg, color)
      }

      regexp.lastIndex = 0
      // @ts-ignore
      callback(regexp.exec(e.message), e, reply)
    }
  })
  logger('Command').debug(`${regexp} 命令注册完成`)
}

export const method = {
  /**
   * @description 发送群聊消息
   * @param message 消息内容
   * @param color 颜色
   * @returns {Promise}
   */
  sendPublicMessage: (message: string, color: string) => {
    status('sendMsg')
    logger('Bot').debug(`发送了群聊消息: ${message}`)
    const data = PublicMessage(message, color)
    return send(data)
  },
  /**
   * @description 发送私聊消息
   * @param message 消息内容
   * @param color 颜色
   * @returns {Promise}
   */
  sendPrivateMessage: (uid: string, message: string, color: string) => {
    logger('Bot').debug(`向 ${uid} 发送了私聊消息: ${message}`)
    const data = PrivateMessage(uid, message, color)
    return send(data)
  },
  /**
   * @description 发送弹幕
   * @param message 消息内容
   * @param color 颜色
   * @returns {Promise}
   */
  sendDamaku: (message: string, color: string) => {
    logger('Bot').debug(`发送了弹幕消息: ${message}`)
    const data = damaku(message, color)
    return send(data)
  },
  /**
   * @description 点赞
   * @param uid ｕｉｄ
   * @param message 消息内容
   * @returns {Promise}
   */
  like: (uid: string, message: string = '') => {
    logger('Bot').debug(`向 ${uid} 发送了点赞, ${message}`)
    const data = Like(uid, message)
    return send(data)
  },
  /**
   * @description 转账
   * @param uid uid
   * @param money 金额
   * @param message 备注
   * @returns {Promise}
   */
  payment: (uid: string, money: number, message: string) => {
    logger('Bot').debug(`向 ${uid} 转账 ${money} 蔷薇币, 留言: ${message}`)
    const data = payment(uid, money, message)
    return send(data)
  },
  /**
   * @description 发送媒体
   * @param type 类型
   * @param title 标题
   * @param signer 歌手
   * @param cover 封面
   * @param link 链接
   * @param url 资源链接
   * @param duration 时长（秒）
   * @param BitRate 比特率
   * @param color 颜色
   * @returns {[Promise, Promise]}
   */
  sendMedia: (type: 'music' | 'video', title: string, signer: string, cover: string, link: string, url: string, duration: number, BitRate: number, color: string) => {
    const cardData = mediaCard(type, title, signer, cover, BitRate, color)
    const mData = mediaData(type, title, signer, cover, link, url, duration)

    return [
      send(cardData),
      send(mData)
    ]
  },
  utils: {
    /**
     * @description 获取用户列表
     * @returns {Promise}
     */
    getUserList: () => {
      return new Promise((resolve, reject) => {
        Bot.once('GetUserListCallback', resolve)
        send(GetUserList())
      })
    },
    /**
     * @description 获取用户资料
     * @param username 用户名
     * @returns {Promise}
     */
    getUserProfile: (username: string) => {
      return new Promise((resolve, reject) => {
        Bot.once('UserProfileCallback', resolve)
        send(UserProfile(username))
      })
    }
  },
  admin: {
    /**
     * @description 黑名单
     * @param username 用户名
     * @param time 时长，与花园写法一致
     * @param msg 备注
     */
    blackList: (username: string, time: string, msg?: string) => {
      const data = blackList(username, time, msg || 'undefined')
      send(data)
    },
    /**
     * @description 踢人
     * @param username 用户名
     */
    kick: (username: string) => {
      const data = kick(username)
      send(data)
    },
    /**
     * @description 禁言
     * @param type 类型
     * @param username 用户名
     * @param time 时长，与花园一致
     * @param msg 备注
     */
    mute: (type: 'chat' | 'music' | 'all', username: string, time: string, msg: string) => {
      const data = mute(type, username, time, msg)
      send(data)
    },
    /**
     * @description 发送房间公告
     * @param msg 消息内容
     */
    notice: (msg: string) => {
      const data = notice(msg)
      send(data)
    },
    /**
     * @description 设置房间最大人数
     * @param num 人数，不填则为不限人数
     */
    setMaxUser: (num?: number) => {
      const data = setMaxUser(num)
      send(data)
    },
    /**
     * @description 白名单
     * @param username 用户名
     * @param time 时长，与花园写法一致
     * @param msg 备注
     */
    whiteList: (username: string, time: string, msg?: string) => {
      const data = whiteList(username, time, msg || 'undefined')
      send(data)
    },
    media: {
      /**
       * @description 清空媒体
       */
      clear: () => {
        const data = mediaClear()
        send(data)
      },
      /**
       * @description 切除媒体
       * @param id 媒体id,不填则为当前媒体
       */
      cut: (id?: string) => {
        const data = mediaCut(id)
        send(data)
      },
      /**
       * @description 媒体排序
       * @param id1 第一个id
       * @param id2 第二个id
       */
      exchange: (id1: string, id2: string) => {
        const data = mediaExchange(id1, id2)
        send(data)
      },
      /**
       * @description 跳转到指定时间
       * @param time 目标时间，与花园写法一致
       */
      goto: (time: string) => {
        const data = mediaGoto(time)
        send(data)
      },
      /**
       * @description 媒体快进快退
       * @param op 操作类型
       * @param time 操作时间，与花园写法一致
       */
      op: (op: '<' | '>', time: string) => {
        const data = mediaOperation(op, time)
        send(data)
      }
    }
  },
  bot: {
    moveTo: (roomId: string) => {
      return moveTo(roomId)
    }
  },
  system: {
    bank: () => {
      return new Promise((resolve, reject) => {
        Bot.once('BankCallback', resolve)
        send(bank())
      })
    }
  }
}

export const Data = path.join(__dirname, '../../data')

try {
  mkdirSync(Data)
} catch (error) {}
