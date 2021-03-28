import { Bot } from '../event'

export interface UserProfileCallback {
  email:string,
  location:string,
  website:string,
  hobby:string,
  intro:string,
  background: string,
  music: string,
  lastLoginTime: Date,
  visits: string,
  title: string,
  rooms: string[],
  tags: string,
  regTime: Date,
  online: string,
  credit: string,
  life: {
    image: string,
    time: Date,
    desc: string
  }[],
  mate: {
    username: string | null,
    avatar: string | null,
    color: string | null
  },
  money: {
    hold: string,
    bank: string
  },
  like: {
    times: number,
    users: string[]
  }
}

export default (message: string) => {
  if (message.substr(0, 2) === '+1') {
    const tmp = message.substr(2).split('>')
    const msg: UserProfileCallback = {
      email: tmp[0],
      location: tmp[4],
      website: tmp[5],
      hobby: tmp[6],
      intro: tmp[8],
      background: tmp[9],
      music: tmp[11],
      lastLoginTime: new Date(Number(tmp[12]) * 1e3),
      visits: tmp[13],
      title: tmp[14],
      rooms: tmp[21].split('"'),
      tags: tmp[22],
      regTime: new Date(Number(tmp[24]) * 1e3),
      online: tmp[25],
      credit: tmp[32],
      life: tmp[31].split('<').map(e => {
        const data = {
          image: `http${e.split(' ')[0]}`,
          time: new Date(Number(e.split(' ')[1]) * 1e3),
          desc: e.split(' ').splice(2).join(' ')
        }
        return data
      }),
      mate: {
        username: tmp[23] ? tmp[23].split('<')[0] : null,
        avatar: tmp[23] ? tmp[23].split('<')[1] : null,
        color: tmp[23] ? tmp[23].split('<')[2] : null
      },
      money: {
        hold: tmp[17],
        bank: tmp[33]
      },
      like: {
        times: Number(tmp[16].split('"')[0]),
        users: tmp[16].split('"')[1].split("'")
      }
    }
    Bot.emit('UserProfileCallback', msg)
    return true
  }
}
