import path from 'path';
import damaku from '../encoder/damaku';
import Like from '../encoder/Like';
import payment from '../encoder/payment';
import PrivateMessage from '../encoder/PrivateMessage';
import PublicMessage from '../encoder/PublicMessage';
import logger from '../logger';
import { Bot } from '../event';
import { send } from '../websocket'
import { PublicMessage as type_PublicMessage } from '../decoder/PublicMessage';
import { mkdirSync } from 'fs';
import config from '../../config';

export const Event =  Bot;

export const command = (regexp: RegExp, callback: (m: RegExpExecArray, e: type_PublicMessage, reply: (message: string, color: string) => void) => void) => {
  Bot.on('PublicMessage', e => {
    if(e.username === config.account.username) return;

    regexp.lastIndex = 0;
    if(regexp.test(e.message)) {
      const reply = (msg: string, color: string) => {
        return method.sendPublicMessage(msg, color);
      }

      regexp.lastIndex = 0;
      //@ts-ignore
      callback(regexp.exec(e.message), e, reply);
    }
  })
}

export const method = {
  sendPublicMessage: (message: string, color: string) => {
    logger('Bot').debug(`发送了群聊消息: ${message}`);
    const data = PublicMessage(message, color);
    return send(data);
  },
  sendPrivateMessage: (uid: string, message: string, color: string) => {
    logger('Bot').debug(`向 ${uid} 发送了私聊消息: ${message}`);
    const data = PrivateMessage(uid, message, color);
    return send(data)
  },
  sendDamaku: (message: string, color: string) => {
    logger('Bot').debug(`发送了弹幕消息: ${message}`);
    const data = damaku(message, color);
    return send(data);
  },
  like: (uid: string, message: string = '') => {
    logger('Bot').debug(`向 ${uid} 发送了点赞, ${message}`);
    const data = Like(uid, message);
    return send(data);
  },
  payment: (uid: string, money: number, message: string) => {
    logger('Bot').debug(`向 ${uid} 转账 ${money} 蔷薇币, 留言: ${message}`);
    const data = payment(uid, money, message);
    return send(data);
  }
}

export const Data = path.join(__dirname, '../../data');

try {
  mkdirSync(Data)
} catch (error) {}