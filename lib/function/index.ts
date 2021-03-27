import fs from 'fs';
import path from 'path';
import config from '../../config';
import { Event, method } from '../api';
import logger from '../logger';

const functionPath = path.join(__dirname, '../../function');

const func: any = {};

fs.readdirSync(functionPath).forEach(e => {
  logger('Plugin').info(`正在加载 ${e} ...`);

  const itemPath = path.join(functionPath, e);
  const packageData = JSON.parse(fs.readFileSync(path.join(itemPath, 'package.json')).toString());
  if(e !== 'core') require(path.join(itemPath, packageData.main));

  func[packageData.id] = {};
  func[packageData.id].helper = Object.values(packageData.commands);
  func[packageData.id].author = packageData.author;
  func[packageData.id].intro = packageData.intro;
  func[packageData.id].name = packageData.name;

  try {
    fs.mkdirSync(`./data/${packageData.id}`)
  } catch (error) {}

  logger('Plugin').info(`${e} 加载完成`);
})

Event.on('PublicMessage', (msg) => {
  const helper = (id: string): string => {
    if(func[id]) {
      const helper = func[id].helper;
      const author = func[id].author;
      const intro = func[id].intro;
      const name = func[id].name;

      const parseAuthor = (type: string, author: string) => {
        const typeMap: any = {
          name: "作者",
          github: "GitHub",
          bilibili: "Bilibili",
          iirose: "蔷薇花园"
        }

        const authorMap: any = {
          name: '{author}',
          github: 'https://github.com/{author}',
          bilibili: 'https://space.bilibili.com/{author}',
          iirose: ' [*{author}*] '
        }

        return `${typeMap[type]}: ${(authorMap[type] || '{author}').replace('{author}', author)}`;
      }

      let maxLen = 0;
      for(const e of helper) {
        if(maxLen < e.cmd.length) maxLen = e.cmd.length;
      }

      const len = maxLen + 6;
      const tmp = [];

      tmp.push(`${name}: `)
      tmp.push('');

      for(const type in author) {
        tmp.push(parseAuthor(type.toLowerCase(), author[type]));
      }

      tmp.push('');
      tmp.push('');
      
      if(intro.length > 0) {
        for(const e of intro) {
          tmp.push(e);
        }
      } else {
        tmp.push('暂无简介')
      }

      tmp.push('');
      tmp.push('');

      for(const e of helper) {
        tmp.push(`${e.cmd}${' '.repeat(len - e.cmd.length)}${e.helper}`);
      }

      return tmp.join('\n');
    } else {
      return `[YakumoRan] 插件未找到`;
    }
  }

  if (msg.message.trim() === '.help') {
    const tmp = [];
    for(const id in func) {
      tmp.push(helper(id));
    }
    method.sendPublicMessage(tmp.join('\n================================\n'), config.app.color);
  } else if (msg.message.substr(0, 5) === '.help') {
    const id = msg.message.substr(6).trim();

    method.sendPublicMessage(helper(id), config.app.color);
  }
})