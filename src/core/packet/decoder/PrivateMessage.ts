import { decode } from 'html-entities'

export interface PrivateMessage {
  timestamp: Number,
  uid: string,
  username: string,
  avatar: string,
  message: string,
  color: string,
  messageId: Number
}

export default (message: string): [string, PrivateMessage][] | undefined => {
  if (message.substring(0, 2) === '""') {
    const item = message.substring(2).split('<')
    const messages: [string, PrivateMessage][] = []

    for (const msg of item) {
      const tmp = msg.split('>')

      if (tmp.length === 11) {
        if (/^\d+$/.test(tmp[0])) {
          const msg: PrivateMessage = {
            timestamp: Number(tmp[0]),
            uid: tmp[1],
            username: decode(tmp[2]),
            avatar: tmp[3],
            message: decode(tmp[4]),
            color: tmp[5],
            messageId: Number(tmp[10])
          }

          messages.push(['PrivateMessage', msg])
        }
      }
    }

    return messages
  }
}
