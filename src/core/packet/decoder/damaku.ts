export interface Damaku {
  username: string,
  avatar: string,
  message: string,
  color: string,
}

export default (message: string): [string, Damaku][] | undefined => {
  if (message.substring(0, 1) === '=') {
    const list = message.substring(1).split('<').map(item => item.split('>'))

    for (const item of list) {
      if (item.length === 6) {
        const msg = {
          username: item[0],
          avatar: item[5],
          message: item[1],
          color: item[2]
        }

        return [['Damaku', msg]]
      }
    }
  }
}
