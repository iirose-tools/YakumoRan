import { Bot } from "../event";

export interface PrivateMessage {
  timestamp: Number,
  uid: string,
  username: string,
  avatar: string,
  message: string,
  color: string,
  messageId: Number
}

export default (message: string) => {
  if(message.substr(0, 1) === '"') {
    const tmp = message.substr(1).split('>')
    if(tmp.length === 11) {
      if(/^\d+$/.test(tmp[0])) {
        const msg = {
          timestamp: Number(tmp[0]),
          uid: tmp[1],
          username: tmp[2],
          avatar: tmp[3],
          message: tmp[4],
          color: tmp[5],
          messageId: Number(tmp[10])
        }
  
        Bot.emit("PrivateMessage", msg);
        return true;
      }
    }
  }
}