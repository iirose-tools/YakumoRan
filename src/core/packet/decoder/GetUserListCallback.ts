export interface GetUserListCallback {
  avatar: string;
  username: string;
  color: string;
  room: string;
  uid: string;
}

export default (message: string): [string, GetUserListCallback[]][] | undefined => {
  if (message.substring(0, 2) === 'u2') {
    const list: GetUserListCallback[] = []

    message.substring(2).split('<').forEach(e => {
      const tmp = e.split('>')
      if (tmp.length >= 8) {
        const data: GetUserListCallback = {
          avatar: tmp[0],
          username: tmp[2],
          color: tmp[3],
          room: tmp[4],
          uid: tmp[8]
        }

        list.push(data)
      }
    })

    return [['GetUserListCallback', list]]
  }
}
