import * as api from '../../lib/api';
import got from 'got';
import config from '../../config';
import util from 'util';

if(!config.chat.disable) {
  api.Event.on('PublicMessage', async (msg) => {
    if (msg.username === config.account.username) return;     // 不响应自己发送的消息
  
    const reply = (message: string) => {
      const data = `${msg.message} (_hr) ${msg.username}_${Math.round(new Date().getTime() / 1e3)} (hr_) ${message}`;
      api.method.sendPublicMessage(data, config.app.color);
    }
  
    if (msg.message.indexOf(`[*${config.account.username}*]`) !== -1 || msg.message.indexOf(config.app.nickname) !== -1) {
      const m = msg.message.replace(`[*${config.account.username}*]`, '').replace(config.app.nickname, '').trim();
  
      if (m.length === 0) {
        reply('阁下有什么事吗？')
      } else {
        try {
          const result = JSON.parse((await got(encodeURI(`http://api.qingyunke.com/api.php?key=free&appid=0&msg=${msg}`))).body);
          reply(result.content.split('{br}').join('\n').replace(/菲菲/gm, config.app.nickname).replace(/妈咪/gm, ' 阁下'));
        } catch (error) {
          reply([
            '出现了意料之外的错误',
            'ERROR:',
            util.inspect(error)
          ].join('\n'))
        }
      }
    }
  })
}