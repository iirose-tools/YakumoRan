import { Bot } from "../event";

export interface PublicMessage {
  timestamp: number,
  avatar: string,
  username: string,
  message: string,
  color: string,
  uid: string,
  title: string,
  messageId: number
}

export default (message: string) => {
  if(message.indexOf('<') !== -1) {
    let parser = false;

    const tmp1 = message.split('<');
    tmp1.forEach(e => {
      const tmp = e.split('>');
      if(/^\d+$/.test(tmp[0])) {
        if(tmp.length === 11) {
          parser = true;
          Bot.emit("PublicMessage", {
            timestamp: Number(tmp[0]),
            avatar: tmp[1],
            username: tmp[2],
            message: tmp[3],
            color: tmp[5],
            uid: tmp[8],
            title: tmp[9] === "'108" ? "花瓣" : tmp[9],
            messageId: Number(tmp[10])
          });
        } else if (tmp.length === 12) {
          if(tmp[3] === "'1") {
            parser = true;
            const msg = {
              timestamp: Number(tmp[0]),
              avatar: tmp[1],
              username: tmp[2],
              color: tmp[5],
              uid: tmp[8],
              title: tmp[9] === "'108" ? "花瓣" : tmp[9],
              room: tmp[10]
            }
      
            Bot.emit('JoinRoom', msg);
          } else if (tmp[3].substr(0, 2) === "'2") {
            parser = true;
            const msg = {
              timestamp: Number(tmp[0]),
              avatar: tmp[1],
              username: tmp[2],
              color: tmp[5],
              uid: tmp[8],
              title: tmp[9] === "'108" ? "花瓣" : tmp[9],
              room: tmp[10],
              targetRoom: tmp[3].substr(2)
            }
      
            Bot.emit("SwitchRoom", msg)
          } else if (tmp[3] === "'3") {
            parser = true;
            const msg = {
              timestamp: Number(tmp[0]),
              avatar: tmp[1],
              username: tmp[2],
              color: tmp[5],
              uid: tmp[8],
              title: tmp[9] === "'108" ? "花瓣" : tmp[9],
              room: tmp[10]
            }
      
            Bot.emit("LeaveRoom", msg)
          }
        }
      }
    })
    
    return parser;
  } else {
    const tmp = message.split('>')
    if(tmp.length === 11) {
      if(/^\d+$/.test(tmp[0])) {
        const msg = {
          timestamp: Number(tmp[0]),
          avatar: tmp[1],
          username: tmp[2],
          message: tmp[3],
          color: tmp[5],
          uid: tmp[8],
          title: tmp[9] === "'108" ? "花瓣" : tmp[9],
          messageId: Number(tmp[10])
        }

        Bot.emit("PublicMessage", msg);
        return true;
      }
    }
  }
}