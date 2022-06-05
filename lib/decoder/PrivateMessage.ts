import { decode } from 'html-entities'
import { Bot } from '../event'
import * as api from '../api'
import config from '../../config'

interface data {
  timestamp: Number,
  uid: string,
  username: string,
  avatar: string,
  message: string,
  color: string,
  messageId: Number
}

export class PrivateMessage {
  public timestamp: Number
  public uid: string
  public username: string
  public avatar: string
  public message: string
  public color: string
  public messageId: Number

  constructor (data: data) {
    this.timestamp = data.timestamp
    this.uid = data.uid
    this.username = data.username
    this.avatar = data.avatar
    this.message = data.message
    this.color = data.color
    this.messageId = data.messageId
  }

  /**
   * @description 发送私聊消息
   * @param msg 消息内容
   */
  pm (msg: string) {
    api.method.sendPrivateMessage(this.uid, msg, config.app.color)
  }

  /**
   * @description 回复消息
   * @param msg 消息内容
   */
  reply (msg: string) {
    api.method.sendPublicMessage(`${this.message} (_hr) ${this.username}_${Math.round(new Date().getTime() / 1e3)} (hr_) ${msg}`, config.app.color)
  }

  /**
   * @description 点赞
   * @param msg 点赞消息
   */
  like (msg: string) {
    api.method.like(this.uid, msg)
  }
}

export default (message: string) => {
  if (message.substr(0, 2) === '""') {
    let flag = false

    const item = message.substr(2).split('<')

    for (const msg of item) {
      const tmp = msg.split('>')

      if (tmp.length === 11) {
        if (/^\d+$/.test(tmp[0])) {
          const msg = new PrivateMessage({
            timestamp: Number(tmp[0]),
            uid: tmp[1],
            username: decode(tmp[2]),
            avatar: tmp[3],
            message: decode(tmp[4]),
            color: tmp[5],
            messageId: Number(tmp[10])
          })
          Bot.emit('PrivateMessage', msg)
          flag = true
        }
      }
    }

    return flag
  }
}
