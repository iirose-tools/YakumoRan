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
    let isPubMsg = true;
    const msg: PublicMessage[] = [];
    const tmp1 = message.split('<');
    tmp1.forEach(e => {
      const tmp = e.split('>');
      if(tmp.length === 11) {
        if(/^\d+$/.test(tmp[0])) {
          msg.push({
            timestamp: Number(tmp[0]),
            avatar: tmp[1],
            username: tmp[2],
            message: tmp[3],
            color: tmp[5],
            uid: tmp[8],
            title: tmp[9] === "'108" ? "花瓣" : tmp[9],
            messageId: Number(tmp[10])
          });
        } else {
          isPubMsg = false;
        }
      } else {
        isPubMsg = false;
      }
    })

    if(isPubMsg) {
      return msg;
    }
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

        return [msg];
      }
    }
  }

  return null;
}