import config from '../../config';
import * as api from '../../lib/api';
import { bili } from './api';

api.command(/(a|A)(v|V)(\d+)/gm, async (m, e, reply) => {
  const aid = m[3];
  const data = await bili.video_aid(aid);
  if (!data) return;
  const t = [];

  t.push(`[Bilibili]`)
  t.push(`[av${data.aid}]`);
  t.push(`[${data.bvid}]`);
  t.push(`https://b23.tv/${data.bvid}`);
  t.push(data.pic);
  t.push(` 标题: ${data.title}`);
  t.push(` 简介: ${data.desc}`);
  t.push(`UP 主: ${data.owner.name}(https://space.bilibili.com/${data.owner.mid})`);
  t.push(` 投稿时间: ${new Date(data.pubdate * 1e3).toISOString().replace('T', ' ').replace(/\.\d+Z/, '')}`);
  t.push(` 分区: ${data.tname}`);
  t.push(` 获赞数: ${data.stat.like}`);
  t.push(` 投币数: ${data.stat.coin}`);
  reply(t.join('\n'), config.app.color);
})

api.command(/BV(\w{10})/gm, async (m, e, reply) => {
  const bvid = m[1];
  const data = await bili.video_bvid(bvid);
  const t = [];

  t.push(`[Bilibili]`)
  t.push(`[av${data.aid}]`);
  t.push(`[${data.bvid}]`);
  t.push(`https://b23.tv/${data.bvid}`);
  t.push(data.pic);
  t.push(` 标题: ${data.title}`);
  t.push(` 简介: ${data.desc}`);
  t.push(`UP 主: ${data.owner.name}(https://space.bilibili.com/${data.owner.mid})`);
  t.push(` 投稿时间: ${new Date(data.pubdate * 1e3).toISOString().replace('T', ' ').replace(/\.\d+Z/, '')}`);
  t.push(` 分区: ${data.tname}`);
  t.push(` 获赞数: ${data.stat.like}`);
  t.push(` 投币数: ${data.stat.coin}`);
  reply(t.join('\n'), config.app.color);
})

api.command(/^B站热搜$/gm, async (m, e, reply) => {
  const data = await bili.hotword();

  if (!data) {
    reply(`[Bilibili] 查询失败`, config.app.color);
  } else {
    const t: string[] = [];
    data.forEach(async (e: any, i: number) => {
      const icon = e.icon.length === 0 ? 'http://i0.hdslb.com/bfs/feed-admin/e9e7a2d8497d4063421b685e72680bf1cfb99a0d.png' : e.icon;
      t.push(`[${icon}@16w_16h?a.jpg] ${i + 1}. ${e.keyword}`);
    });
    reply(t.join('\n'), config.app.color);
  }
})

api.command(/^今日新番$/, async (m, e, reply) => {
  const data: any = await bili.bangumi.today();
  const mapping: any = {
    1: ' 一',
    2: ' 二',
    3: ' 三',
    4: ' 四',
    5: ' 五',
    6: ' 六',
    7: ' 日'
  };

  if (data) {
    const week: string = mapping[data.day_of_week] || data.day_of_week;
    const msg: string[] = [];

    msg.push(`今天是 星期 ${week}, 将有 ${Object.keys(data.seasons).length} 部新番放送！`)

    Object.values(data.seasons).forEach((e: any) => {
      msg.push(`《${e.title}》将于 ${e.pub_time} 更新 ${e.pub_index}`)
    });

    reply(msg.join('\n'), config.app.color);
  } else {
    reply('[Bilibili] 读取失败', config.app.color);
  }
})