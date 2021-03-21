import { Bot } from "../event";

export interface Music {
  url: string,
  link: string,
  duration: number,
  title: string,
  singer: string,
  owner: string,
  pic: string
}

export default (message: string) => {
  if (message.substr(0, 2) === '&1') {
    const tmp = message.substr(2).split('>');
    if(tmp.length === 7) {
      const msg = {
        url: `http${tmp[0].split(' ')[0]}`,
        link: `http${tmp[0].split(' ')[1]}`,
        duration: Number(tmp[1]),
        title: tmp[2],
        singer: tmp[3].substr(2),
        owner: tmp[4],
        pic: `http${tmp[6]}`
      }

      Bot.emit("music", msg);
      return true;
    }
  }
}