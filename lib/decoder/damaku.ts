import { Bot } from '../event';

export interface Damaku {
  username: string,
  avatar: string,
  message: string,
  color: string,
}

export default (message: string) => {
  if(message.substr(0, 1) === '=') {
    const tmp = message.substr(1).split('>')
    if(tmp.length === 6) {
      const msg = {
        username: tmp[0],
        avatar: tmp[5],
        message: tmp[1],
        color: tmp[2],
      }

      Bot.emit("damaku", msg);
      return true;
    }
  }
}