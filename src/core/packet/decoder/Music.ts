export interface Music {
  url: string,
  link: string,
  duration: number,
  title: string,
  singer: string,
  owner: string,
  pic: string
}

export default (message: string): [string, Music][] | undefined => {
  if (message.substring(0, 2) === '&1') {
    const tmp = message.substring(2).split('>')
    if (tmp.length === 7) {
      const msg = {
        url: `http${tmp[0].split(' ')[0]}`,
        link: `http${tmp[0].split(' ')[1]}`,
        duration: Number(tmp[1]),
        title: tmp[2],
        singer: tmp[3].substring(2),
        owner: tmp[4],
        pic: `http${tmp[6]}`
      }

      return [['Music', msg]]
    }
  }
}
