import status from './status';
import decoder from '../decoder';
import login from '../encoder/system/login';
import { WebSocket, Bot } from '../event';
import logger from '../logger';
import init, { send } from '../websocket';

Bot.on("PublicMessage", msg => {
  logger("Bot").info(`${msg.username} > ${msg.message}`);
})

WebSocket.on('message', (msg) => {
  if(!decoder(msg)) {
    logger("Decoder").warn("收到了无法解析的消息: ", (msg.length > 50) ? `${msg.substr(0, 50)}...` : msg);
  }
})

WebSocket.once('connect', () => {
  status("connected");
  setInterval(() => {
    send('');
  }, 6e4)
})

WebSocket.on('connect', async () => {
  const err = await send(login())
  if(err) {
    status("login_fail");
    logger('Core').error('登录包发送失败', err);
  } else {
    WebSocket.once('message', (msg) => {
      status("login_success");
      send('');
      logger('Core').info('收到服务器返回数据, 登录成功');
      Bot.emit('login')
    })
    logger('Core').info('登录包发送成功');
  }
});

init();
status("start");

setInterval(() => {
  status("heartbeat");
}, 3e4)