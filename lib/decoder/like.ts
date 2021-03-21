import { Bot } from "../event";

export interface Like {
  username: string,
  avatar: string,
  message: string,
  background: string,
  timestamp: number,
  color: string
}

export default (message: string) => {
  if(message.substr(0, 2) === '@*') {
    const tmp = message.substr(2).split('>')
    if(tmp.length === 7) {
      const msg = {
        username: tmp[0],
        avatar: tmp[1],
        message: tmp[3].substr(2),
        background: tmp[4],
        timestamp: Number(tmp[5]),
        color: tmp[6]
      }

      Bot.emit("like", msg);
      return true;
    }
  }
}