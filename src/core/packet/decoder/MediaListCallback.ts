import { decode } from 'html-entities'

export interface MediaListCallback {
  id: string,
  length: number,
  title: string,
  color: string,
  name: string,
  type: number,
  avatar: string,
  cover: string
}

export default (message: string): [string, MediaListCallback[]][] | undefined => {
  if (message.substr(0, 1) === '~') {
    const result: MediaListCallback[] = message.substr(1).split('<').map((e, i) => {
      const tmp = e.split('>')
      return {
        id: `${i}_${tmp[0]}`,
        length: Number(tmp[0]),
        title: decode(tmp[1]),
        color: tmp[2].substr(0, 6),
        name: tmp[2].substr(6),
        type: Number(tmp[3]),
        avatar: tmp[4],
        cover: `http${tmp[5]}`
      }
    })

    return [['MediaListCallback', result]]
  }
}
