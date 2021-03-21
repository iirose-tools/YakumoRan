import { Bot } from "../event";

export interface UserList {
  avatar: string;
  username: string;
  color: string;
  room: string;
  uid: string;
}

export default (message: string) => {
  if (message.substr(0, 3) === '%*"') {
    const list: UserList[] = [];
    message.substr(3).split('<').forEach((e, i) => {
      const tmp = e.split('>');
      if(tmp.length >= 8) {
        list.push({
          avatar: tmp[0],
          username: tmp[2],
          color: tmp[3],
          room: tmp[4],
          uid: tmp[8]
        });
      }
    });

    Bot.emit("UserList", list);
    return true;
  }
}