import { Bot } from '../event'

export interface Damaku {
  username: string,
  avatar: string,
  message: string,
  color: string,
}

export default (message: string) => {
  if (message.substr(0, 1) === '=') {
    const list = message.substr(1).split('<').map(item => item.split('>'))

    let status = false

    for (const item of list) {
      if (item.length === 6) {
        const msg = {
          username: item[0],
          avatar: item[5],
          message: item[1],
          color: item[2]
        }

        Bot.emit('damaku', msg)

        status = true
      }
    }

    return status
  }
}
