import { Bot } from '../event'
import { decode } from 'html-entities'

export interface RoomNotice {
  notice: string
  background: string
  timestamp: number
}

export interface Follower {
  username: string
  avatar: string
  gender: string
  background: string
  timestamp: number
  color: string
}

export interface Like {
  username: string
  avatar: string
  gender: string
  background: string
  timestamp: number
  color: string
  message: string
}

export interface Payment {
  username: string
  avatar: string
  gender: string
  background: string
  timestamp: number
  color: string
  message: string
  money: number
}

export default (message: string) => {
  if (/^@/.test(message)) {
    let parser = false

    message.slice(2).split('<').forEach(e => {
      const tmp = e.split('>')
      if (tmp.length === 3) {
        parser = true
        Bot.emit('roomNotice', {
          notice: decode(tmp[0]),
          background: tmp[1],
          timestamp: Number(tmp[2])
        })
      }
      if (tmp.length === 7) {
        if (/^'\^/.test(tmp[3])) {
          parser = true
          const data = {
            username: decode(tmp[0]),
            avatar: tmp[1],
            gender: tmp[2],
            background: tmp[4],
            timestamp: Number(tmp[5]),
            color: tmp[6]
          }
          Bot.emit('follower', data)
        } else if (/^'\*/.test(tmp[3])) {
          parser = true
          const data = {
            username: decode(tmp[0]),
            avatar: tmp[1],
            gender: tmp[2],
            background: tmp[4],
            timestamp: Number(tmp[5]),
            color: tmp[6],
            message: decode(tmp[3].substr(3))
          }
          Bot.emit('like', data)
        } else if (/^'\$/.test(tmp[3])) {
          parser = true
          const data = {
            username: decode(tmp[0]),
            avatar: tmp[1],
            gender: tmp[2],
            money: parseInt(tmp[3].split(' ')[0].substr(2)),
            message: decode(tmp[3].split(' ')[1] || ''),
            background: tmp[4],
            timestamp: Number(tmp[5]),
            color: tmp[6]
          }
          Bot.emit('payment', data)
        }
      }
    })

    return parser
  }
}
