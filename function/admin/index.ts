import config from '../../config';
import * as Ran from '../../lib/api';

Ran.Event.on('PublicMessage', msg => {
  if(msg.username === config.account.username) return;
  if(msg.username === config.app.master) {
    const m = msg.message.trim();
    if(m.substr(0, 1) === '/') {
      const cmd = m.substr(1).split(' ');
      if(cmd[0] === 'mute' && msg.replyMessage) {
        //@ts-ignore
        const type: "chat" | "music" | "all" = cmd[1] ? cmd[1] : "all";
        const user = msg.replyMessage.pop();
        if(user) {
          Ran.method.admin.mute(type, user.username, "30m", cmd[2] ? cmd[2] : "?");
        }
      } else if(cmd[0] === 'kick' && msg.replyMessage) {
        const user = msg.replyMessage.pop();
        if(user) {
          Ran.method.admin.kick(user.username);
        }
      } else if(cmd[0] === 'ban' && msg.replyMessage) {
        const user = msg.replyMessage.pop();
        if(user) {
          Ran.method.admin.blackList(user.username, "1d", cmd[1] ? cmd[1] : "?");
        }
      }
    }
  }
})