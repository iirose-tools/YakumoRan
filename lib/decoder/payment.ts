import { Bot } from '../event'

export interface Payment {
  username: string,
  avatar: string,
  money: number,
  message: string,
  time: Date,
  color: string,
}

export default (msg: string) => {
  if (msg.substr(0, 2) === '@*') {
    const tmp = msg.substr(2).split('>')
    if (tmp.length === 7 && tmp[2] === '2') {
      const data = {
        username: tmp[0],
        avatar: tmp[1],
        money: parseInt(tmp[3].split(' ')[0].substr(2)),
        message: tmp[3].split(' ')[1],
        time: new Date(Number(tmp[5]) * 1000),
        color: tmp[6]
      }

      Bot.emit('payment', data)

      return true
    }
  }
}
