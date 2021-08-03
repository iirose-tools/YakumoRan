import { Bot } from '../event'

export interface SelfMove {
  id: string
}

export default (message: string) => {
  if (message.substr(0, 2) === '-*') {
    const msg = {
      id: message.substr(2)
    }

    Bot.emit('SelfMove', msg)
    return true
  }
}
