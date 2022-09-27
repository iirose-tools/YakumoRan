import { Bot } from '.'
import { Config } from '../config/config'
import { Logger } from '../logger'
import { WebSocket } from '../network'
import { Encoder } from '../packet'
import { GetUserListCallback } from '../packet/decoder/GetUserListCallback'
import { MediaListCallback } from '../packet/decoder/MediaListCallback'
import { UserProfileCallback } from '../packet/decoder/UserProfileCallback'

export class API {
  private socket: WebSocket
  private encoder = new Encoder()
  private config: Config
  private logger: Logger
  private bot: Bot

  constructor (socket: WebSocket, config: Config, bot: Bot) {
    this.socket = socket
    this.config = config
    this.logger = new Logger('BotAPI')
    this.bot = bot
  }

  /**
 * @description 发送群聊消息
 * @param message 消息内容
 * @param color 颜色
 * @returns {Promise}
 */
  sendPublicMessage (message: string, color?: string) {
    this.logger.debug(`发送了群聊消息: ${message}`)
    const data = this.encoder.messages.publicMessage(message, color || this.config.getConfig().bot.color)
    return this.socket.send(data)
  }

  /**
   * @description 发送私聊消息
   * @param message 消息内容
   * @param color 颜色
   * @returns {Promise}
   */
  sendPrivateMessage (uid: string, message: string, color?: string) {
    this.logger.debug(`向 ${uid} 发送了私聊消息: ${message} `)
    const data = this.encoder.messages.privateMessage(uid, message, color || this.config.getConfig().bot.color)
    return this.socket.send(data)
  }

  /**
   * @description 发送弹幕
   * @param message 消息内容
   * @param color 颜色
   * @returns {Promise}
   */
  sendDamaku (message: string, color: string) {
    this.logger.debug(`发送了弹幕消息: ${message} `)
    const data = this.encoder.messages.damaku(message, color)
    return this.socket.send(data)
  }

  /**
   * @description 点赞
   * @param uid uid
   * @param message 消息内容
   * @returns {Promise}
   */
  like (uid: string, message: string = '') {
    this.logger.debug(`向 ${uid} 发送了点赞, ${message} `)
    const data = this.encoder.system.like(uid, message)
    return this.socket.send(data)
  }

  /**
   * @description 转账
   * @param uid uid
   * @param money 金额
   * @param message 备注
   * @returns {Promise}
   */
  payment (uid: string, money: number, message: string) {
    this.logger.debug(`向 ${uid} 转账 ${money} 蔷薇币, 留言: ${message} `)
    const data = this.encoder.system.payment(uid, money, message)
    return this.socket.send(data)
  }

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
  sendMedia (
    type: 'music' | 'video',
    title: string,
    signer: string,
    cover: string,
    link: string,
    url: string,
    duration: number,
    BitRate: number,
    color: string
  ) {
    const cardData = this.encoder.messages.mediaCard(type, title, signer, cover, BitRate, color)
    const mData = this.encoder.messages.mediaData(type, title, signer, cover, link, url, duration)

    return [this.socket.send(cardData), this.socket.send(mData)]
  }

  getUserList (): Promise<GetUserListCallback[]> {
    return new Promise((resolve, reject) => {
      this.bot.once('GetUserListCallback', resolve)
      this.socket.send(this.encoder.system.getUserList())
    })
  }

  /**
   * @description 获取用户资料
   * @param username 用户名
   * @returns {Promise}
   */
  getUserProfile (username: string): Promise<UserProfileCallback> {
    return new Promise((resolve, reject) => {
      this.bot.once('UserProfileCallback', resolve)
      this.socket.send(this.encoder.user.userProfile(username.toLowerCase()))
    })
  }

  /**
   * @description 获取媒体列表
   * @returns {Promise}
   */
  getMediaList (): Promise<MediaListCallback[]> {
    return new Promise((resolve, reject) => {
      this.bot.once('MediaListCallback', resolve)
      this.socket.send(this.encoder.system.mediaList())
    })
  }

  /**
   * @description 黑名单
   * @param username 用户名
   * @param time 时长，与花园写法一致
   * @param msg 备注
   */
  blackList (username: string, time: string, msg?: string) {
    const data = this.encoder.admin.blacklist(username, time, msg || 'undefined')
    this.socket.send(data)
  }

  /**
   * @description 踢人
   * @param username 用户名
   */
  kick (username: string) {
    const data = this.encoder.admin.kick(username)
    this.socket.send(data)
  }

  /**
   * @description 禁言
   * @param type 类型
   * @param username 用户名
   * @param time 时长，与花园一致
   * @param msg 备注
   */
  mute (
    type: 'chat' | 'music' | 'all',
    username: string,
    time: string,
    msg: string
  ) {
    const data = this.encoder.admin.mute(type, username, time, msg)
    this.socket.send(data)
  }

  /**
   * @description 发送房间公告
   * @param msg 消息内容
   */
  notice (msg: string) {
    const data = this.encoder.admin.notice(msg)
    this.socket.send(data)
  }

  /**
   * @description 设置房间最大人数
   * @param num 人数，不填则为不限人数
   */
  setMaxUser (num?: number) {
    const data = this.encoder.admin.setMaxUser(num)
    this.socket.send(data)
  }

  /**
   * @description 白名单
   * @param username 用户名
   * @param time 时长，与花园写法一致
   * @param msg 备注
   */
  whiteList (username: string, time: string, msg?: string) {
    const data = this.encoder.admin.whitelist(username, time, msg || 'undefined')
    this.socket.send(data)
  }

  /**
   * @description 清空媒体
   */
  clear () {
    const data = this.encoder.admin.media.clear()
    this.socket.send(data)
  }

  /**
   * @description 切除媒体
   * @param id 媒体id,不填则为当前媒体
   */
  cut (id?: string) {
    const data = this.encoder.admin.media.cut(id)
    this.socket.send(data)
  }

  /**
   * @description 交换两个媒体的位置
   * @param id1 第一个id
   * @param id2 第二个id
   */
  exchange (id1: string, id2: string) {
    const data = this.encoder.admin.media.exchange(id1, id2)
    this.socket.send(data)
  }

  /**
   * @description 跳转到指定时间
   * @param time 目标时间，与花园写法一致
   */
  goto (time: string) {
    const data = this.encoder.admin.media.goto(time)
    this.socket.send(data)
  }

  /**
   * @description 媒体快进快退
   * @param op 操作类型
   * @param time 操作时间，与花园写法一致
   */
  operation (op: '<' | '>', time: string) {
    const data = this.encoder.admin.media.operation(op, time)
    this.socket.send(data)
  }

  /**
   * @description 移动到指定位置
   */
  moveTo (room: string, password: string) {
    const config = this.config.getConfig()
    config.bot.room = room
    config.bot.room_password = password

    this.config.setConfig(config)

    this.socket.close()
    setTimeout(() => this.socket.connect(), 500)
  }
}
