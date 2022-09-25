import { Encoder, Decoder } from "../packet";
import { Config } from "../config/config";
import { WebSocket } from "../network";
import { EventEmitter } from "events";
import { Logger } from "../logger";

import { Music as typesMusic } from '../packet/decoder/Music'
import { Damaku as typesDamaku } from '../packet/decoder/damaku'
import { SelfMove as typesSelfMove} from '../packet/decoder/SelfMove'
import { UserList as typesUserList } from '../packet/decoder/userlist'
import { SystemMessage as typesJoinRoom } from '../packet/decoder/JoinRoom'
import { SwitchRoom as typesSwitchRoom } from '../packet/decoder/SwitchRoom'
import { SystemMessage as typesLeaveRoom } from '../packet/decoder/LeaveRoom'
import { BankCallback as typesBankCallback } from '../packet/decoder/BankCallback'
import { PublicMessage as typesPublicMessage } from '../packet/decoder/PublicMessage'
import { PrivateMessage as typesPrivateMessage } from '../packet/decoder/PrivateMessage'
import { paymentCallback as typesPaymentCallback } from '../packet/decoder/paymentCallback'
import { MediaListCallback as typesMediaListCallback } from '../packet/decoder/MediaListCallback'
import { GetUserListCallback as typesGetUserListCallback } from '../packet/decoder/GetUserListCallback'
import { UserProfileCallback as typesUserProfileCallback } from '../packet/decoder/UserProfileCallback'
import { RoomNotice as typesRoomNotice, Follower as typesFollower, Like as typesLike, Payment as typesPayment } from '../packet/decoder/MailboxMessage'
import { globalInstances } from "../global";


export interface IEmissions {
  /**
   * @description 弹幕消息
   */
  Damaku(data: typesDamaku): void
  /**
   * @description 用户进入房间
   */
  JoinRoom(data: typesJoinRoom): void
  /**
   * @description 用户离开房间
   */
  LeaveRoom(data: typesLeaveRoom): void
  /**
   * @description 用户切换房间
   */
  SwitchRoom(data: typesSwitchRoom): void
  /**
   * @description 播放媒体消息
   */
  Music(data: typesMusic): void
  /**
   * @description 私聊消息
   */
  PrivateMessage(data: typesPrivateMessage): void
  /**
   * @description 群聊消息
   */
  PublicMessage(data: typesPublicMessage): void
  /**
   * @description 转账成功回调(不建议手动处理回调信息，直接调用对应API等待返回值即可)
   */
  PaymentCallback(data: typesPaymentCallback): void
  /**
   * @description 服务端推送用户列表
   */
  UserList(data: typesUserList): void
  /**
   * @description 获取用户列表回调(不建议手动处理回调信息，直接调用对应API等待返回值即可)
   */
  GetUserListCallback(data: typesGetUserListCallback): void
  /**
   * @description 获取用户信息回调(不建议手动处理回调信息，直接调用对应API等待返回值即可)
   */
  UserProfileCallback(data: typesUserProfileCallback): void
  /**
   * @description 获取用户银行信息回调(不建议手动处理回调信息，直接调用对应API等待返回值即可)
   */
  BankCallback(data: typesBankCallback): void
  /**
   * @description 获取媒体列表回调(不建议手动处理回调信息，直接调用对应API等待返回值即可)
   */
  MediaListCallback(data: typesMediaListCallback): void
  /**
   * @description 机器人账号移动至其他房间(不建议插件处理此事件，核心部分已经处理好了机器人的重连和重连后的房间切换)
   */
  SelfMove(data: typesSelfMove): void
  /**
   * @description 星标发送的房间公告
   */
  RoomNotice(data: typesRoomNotice): void
  /**
   * @description 新增关注
   */
  Follower(data: typesFollower): void
  /**
   * @description 新增点赞
   */
  Like(data: typesLike): void
  /**
   * @description 其他人向机器人转账
   */
  Payment(data: typesPayment): void
  /**
   * @description 登录成功
   */
  Login(): void
  /**
   * @description 机器人接收到的所有事件
   * @param event 事件名称
   * @param data 事件数据
   */
  __ALL__(event: keyof IEmissions, data: any) : void
}

export class Bot extends EventEmitter {
  private decoder: Decoder
  private socket: WebSocket
  private logger = new Logger('Bot Core')
  private config: Config

  private _untypedOn = this.on
  private _untypedEmit = this.emit
  public on = <K extends keyof IEmissions>(event: K, listener: IEmissions[K]): this => this._untypedOn(event, listener)
  public emit = <K extends keyof IEmissions>(event: K, ...args: Parameters<IEmissions[K]>): boolean => this._untypedEmit(event, ...args)

  constructor(config: Config) {
    super()

    this.config = config
    this.decoder = new Decoder()
    this.socket = new WebSocket()

    // 开始处理事件
    this.socket.on("message", (packet: string) => {
      const result = this.decoder.autoDecoder(packet)
      if (!result) {
        this.logger.warn(`收到了无法解析的数据包: ${packet.length > 50 ? packet.slice(0, 50) + '...' : packet}`)
        return
      }

      for (const [event, data] of result) {
        this.emit(event as keyof IEmissions, data)
        this.emit('__ALL__', event as keyof IEmissions, data)
      }
    })

    // 机器人登录
    this.socket.on('open', async () => {
      this.logger.info('登陆中...')
      const username = this.config.getConfig().bot.username
      const password = this.config.getConfig().bot.password
      const room = this.config.getConfig().bot.room
      const roomPassword = this.config.getConfig().bot.room_password

      this.socket.once('message', (msg) => {
        if (msg === '%*"2') {
          this.logger.fatal('登录失败，密码错误')
          process.exit(1)
        } else if (msg === '%*"1') {
          this.logger.fatal('登录失败，用户不存在')
          process.exit(1)
        } else if (msg === '%*"0') {
          // 这种错误真的需要处理吗(?)
          this.logger.fatal('登录失败，此名字已被占用')
          process.exit(1)
        } else {
          this.logger.info('收到服务器返回数据, 登录成功')
          this.logger.debug('咱的聊天群：700080009')
          this.emit('Login')
        }
      })

      const packet = new Encoder().system.login(username, password, room, roomPassword)
      this.socket.send(packet)
      this.logger.info('登录包已发送，等待服务器响应...')
    })

    const username = this.config.getConfig().bot.username
    globalInstances[username] = this
  }
}