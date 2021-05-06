import { WebSocket } from './event'

export const isTest = process.env.NODE_ENV === 'test'

let listenList: {
  regexp: RegExp,
  callback: Function
}[] = []

WebSocket.on('send', data => {
  for (const item of listenList) {
    if (item.regexp.test(data)) {
      listenList = listenList.filter(e => {
        if (e.regexp === item.regexp) return false
        return true
      })
      item.callback(data)
    }
  }
})

export const onSend = (regexp: RegExp, callback: Function) => {
  listenList.push({ regexp, callback })
}
