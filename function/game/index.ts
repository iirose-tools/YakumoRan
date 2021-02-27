import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as Ran from '../../lib/api';
import logger from '../../lib/logger';

const random = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n); };

const stats = {
  id: 0,
  question: "",
  answer: "",
  allow: false
}

const getQuestion = () => {
  try {
    const data: any = Object.values(JSON.parse(readFileSync(join(__dirname, "./LanternRiddles.json")).toString()));
    
    const len = data.length - 1;
    const id = random(0, len);
    const result = data[id];

    return {
      id: id,
      question: result[0],
      answer: result[1]
    };
  } catch (error) {
    return {
      id: -1,
      question: undefined,
      answer: undefined
    };
  }
}

Ran.Event.on('PublicMessage', msg => {
  const reply = (message: string) => {
    const data = `${msg.message} (_hr) ${msg.username}_${Math.round(new Date().getTime() / 1e3)} (hr_) ${message}`;
    Ran.method.sendPublicMessage(data, "f02d2d");
  }

  if (stats.allow) {
    if (msg.message.trim() === stats.answer) {
      stats.allow = false;
      logger("ACTIVE").info(msg.username, "答对了第", stats.id, "题");
      reply("回答正确!");
    }
  }
})

Ran.command(/^结束灯谜$/, (m, msg) => {
  stats.allow = false;
  stats.question = "";
  stats.answer = "";
  stats.id = 0;

  const reply = (message: string) => {
    const data = `${msg.message} (_hr) ${msg.username}_${Math.round(new Date().getTime() / 1e3)} (hr_) ${message}`;
    Ran.method.sendPublicMessage(data, "f02d2d");
  }

  reply("已结束本场灯谜，要开始灯谜请发送 \"灯谜\"");
})

Ran.command(/^灯谜$/, () => {
  if(stats.allow) {
    Ran.method.sendPublicMessage("有一个正在进行的游戏", "f02d2d")
    return;
  }

  const result = getQuestion();
  if(result.question) {
    stats.answer = result.answer;
    stats.question = result.question;
    stats.id = Number(result.id);
    
    Ran.method.sendPublicMessage([
      "请听题: ",
      '',
      '',
      result.question
    ].join('\n'), "f02d2d")

    stats.allow = true;
  } else {
    Ran.method.sendPublicMessage("灯谜读取失败", "f02d2d")
  }
})