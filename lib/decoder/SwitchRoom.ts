import { Bot } from '../event'

export interface SwitchRoom {
  timestamp: number,
  avatar: string,
  username: string,
  color: string,
  uid: string,
  title: string,
  room: string,
  targetRoom: string
}

export default (message: string) => {
  const tmp = message.split('>')
  if (tmp.length === 12) {
    if (/\d+/.test(tmp[0])) {
      if (tmp[3].substr(0, 2) === "'2") {
        const msg = {
          timestamp: Number(tmp[0]),
          avatar: tmp[1],
          username: tmp[2],
          color: tmp[5],
          uid: tmp[8],
          title: tmp[9] === "'108" ? '花瓣' : tmp[9],
          room: tmp[10],
          targetRoom: tmp[3].substr(2)
        }

        Bot.emit('SwitchRoom', msg)
        return true
      }
    }
  }
}
