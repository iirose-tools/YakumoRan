import decoder from '../decoder';
import login from '../encoder/login';
import { WebSocket, Bot } from '../event';
import logger from '../logger';
import init, { send } from '../websocket';

WebSocket.on('message', (msg) => {
  const result = decoder(msg);
  if(result.type === 'PublicMessage') {
    logger('Core').debug(`收到了 ${result.type} 消息`, result.data)
    Object.values(result.data).forEach(e => {
      //@ts-ignore
      Bot.emit(result.type, e)
    })
  } else if (result.type !== 'unknown') {
    if(result.type !== 'UserList') logger('Core').debug(`收到了 ${result.type} 消息`, result.data)
    //@ts-ignore
    Bot.emit(result.type, result.data)
  } else {
    logger('Decoder').warn('收到了无法解析的消息', (msg.length > 100) ? `${msg.substr(0, 100)}...` : msg, `(length: ${msg.length})`);
  }
})

WebSocket.once('connect', () => {
  setInterval(() => {
    send('');
  }, 6e4)
})

WebSocket.on('connect', async () => {
  const err = await send(login())
  if(err) {
    logger('Core').error('登录包发送失败', err);
  } else {
    WebSocket.once('message', (msg) => {
      send('');
      logger('Core').info('收到服务器返回数据, 登录成功');
      Bot.emit('login')
    })
    logger('Core').info('登录包发送成功');
  }
});

init();