import config from '../../config';
import * as api from '../../lib/api';
import * as arknights from './api';

api.command(/查物品(.*)/, async (m, e, reply) => {
  const result = await arknights.getItem(m[1]);
  if (result) {
    const msg: string[] = [];
    result.forEach(e => {
      msg.push(`[${e.name}]\n ${e.usage.replace('\\n', '\n')} \n ${e.description.replace('\\n', '\n')}`);
    })
    reply(msg.join('\n\n==========================\n\n'), config.app.color);
  } else {
    reply('[Arknights] 未找到', config.app.color)
  }
})

api.command(/查掉落(.*)/, async (m, e, reply) => {
  reply('[Arknights] 正在查询...', config.app.color);
  const stats = {
    query: 0,
    startAt: new Date().getTime() / 1e3
  };
  const msg: string[] = [];
  const p1: any[] = [];
  const p2: any[] = [];
  // 查询物品 id
  const result = await arknights.getItem(m[1]);
  stats.query++;
  if (result) {
    for (const index in result) {
      const item = result[index];
      // 查询物品掉落
      stats.query++;
      const tmp = arknights.GetMatrix(item.itemId);
      p1.push(tmp);
      tmp.then(matrix => {
        if (matrix) {
          for (const index in matrix) {
            const e = matrix[index];
            const rate = e.quantity / e.times;
            // 查询关卡信息
            stats.query++;
            const tmp = arknights.getStagesByID(e.stageId);
            p2.push(tmp);
            tmp.then((stage: any) => {
              if (stage) {
                const cost = Math.round((stage.apCost / rate) * 1e2) / 1e2;
                msg.push(`[${item.name} - ${stage.code}] 掉落率: ${Math.round(rate * 1e4) / 1e2}%, 理智消耗: ${stage.apCost}, 平均单件消耗理智: ${cost}`);
              }
            })
          }
        }
      })
    }

    Promise.all(p1).then(e => {
      Promise.all(p2).then(e => {
        msg.push(`[Status] 请求次数: ${stats.query}`);
        msg.push(`[Status] 查询耗时: ${Math.round(((new Date().getTime() / 1e3) - stats.startAt) * 1e6) / 1e6}s`);
        reply(msg.join('\n'), config.app.color);
      })
    })
  } else {
    reply('[Arknights] 未找到 \n [Status] 请求次数: 1', config.app.color);
  }
})