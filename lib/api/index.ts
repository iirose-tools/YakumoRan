import path from 'path';
import damaku from '../encoder/messages/damaku';
import Like from '../encoder/system/Like';
import payment from '../encoder/system/payment';
import PrivateMessage from '../encoder/messages/PrivateMessage';
import PublicMessage from '../encoder/messages/PublicMessage';
import logger from '../logger';
import { Bot } from '../event';
import { send } from '../websocket'
import { PublicMessage as type_PublicMessage } from '../decoder/PublicMessage';
import { mkdirSync } from 'fs';
import config from '../../config';
import media_card from '../encoder/messages/media_card';
import media_data from '../encoder/messages/media_data';
import status from '../core/status';
import blackList from '../encoder/admin/blackList';
import kick from '../encoder/admin/kick';
import media_clear from '../encoder/admin/media_clear';
import media_cut from '../encoder/admin/media_cut';
import media_exchange from '../encoder/admin/media_exchange';
import media_goto from '../encoder/admin/media_goto';
import media_operation from '../encoder/admin/media_operation';
import mute from '../encoder/admin/mute';
import notice from '../encoder/admin/notice';
import setMaxUser from '../encoder/admin/setMaxUser';
import whiteList from '../encoder/admin/whiteList';

export const Event =  Bot;

export const command = (regexp: RegExp, callback: (m: RegExpExecArray, e: type_PublicMessage, reply: (message: string, color: string) => void) => void) => {
  Bot.on('PublicMessage', e => {
    if(e.username === config.account.username) return;

    regexp.lastIndex = 0;
    if(regexp.test(e.message)) {
      status("command");
      logger('Command').info(`${e.username} 触发了 ${regexp} 命令: ${e.message}`);

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
    status("sendMsg");
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
  },
  sendMedia: (type: "music" | "video", title: string, signer: string, cover: string, link: string, url: string, duration: number, BitRate: number, color: string) => {
    const cardData = media_card(type, title, signer, cover, BitRate, color);
    const mediaData = media_data(type, title, signer, cover, link, url, duration);

    return [
      send(cardData),
      send(mediaData)
    ];
  },
  admin: {
    blackList: (username: string, time: string, msg?: string) => {
      const data = blackList(username, time, msg || "undefined");
      send(data);
    },
    kick: (username: string) => {
      const data = kick(username);
      send(data);
    },
    mute: (type: "chat" | "music" | "all", username: string, time: string, msg: string) => {
      const data = mute(type, username, time, msg);
      send(data);
    },
    notice: (msg: string) => {
      const data = notice(msg);
      send(data);
    },
    setMaxUser: (num?: number) => {
      const data = setMaxUser(num);
      send(data);
    },
    whiteList: (username: string, time: string, msg?: string) => {
      const data = whiteList(username, time, msg || "undefined");
      send(data);
    },
    media: {
      clear: () => {
        const data = media_clear();
        send(data);
      },
      cut: (id?: string) => {
        const data = media_cut(id);
        send(data);
      },
      exchange: (id1: string, id2: string) => {
        const data = media_exchange(id1, id2);
        send(data);
      },
      goto: (time: string) => {
        const data = media_goto(time);
        send(data);
      },
      op: (op: "<" | ">", time: string) => {
        const data = media_operation(op, time);
        send(data);
      }
    }
  }
}

export const Data = path.join(__dirname, '../../data');

try {
  mkdirSync(Data)
} catch (error) {}