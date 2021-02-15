import got from 'got';
import NodeCache from 'node-cache';

const cache: NodeCache = new NodeCache();

export const bili = {
  video_aid: async (aid: string) => {
    const key = `video_${aid}`;
    const c: string | undefined = cache.get(key);

    if(c) return JSON.parse(c)

    const r = await got(`http://api.bilibili.com/x/web-interface/view?aid=${aid}`);
    const e = JSON.parse(r.body);
    
    if(e.code === 0){
      cache.set(key, JSON.stringify(e.data), 3600*12);
      return e.data;
    }
    
    return null;
  },
  video_bvid: async (bvid: string) => {
    const key = `video_${bvid}`;
    const c: string | undefined = cache.get(key);

    if(c) return JSON.parse(c)

    const r = await got(`http://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
    const e = JSON.parse(r.body);
    
    if(e.code === 0){
      cache.set(key, JSON.stringify(e.data), 3600*12);
      return e.data;
    }
    
    return null;
  },
  audio: async (sid: string) => {
    const key = `audio${sid}`;
    const c: string | undefined = cache.get(key);

    if(c) return JSON.parse(c)

    const r = await got(`https://www.bilibili.com/audio/music-service-c/web/song/info?sid=${sid}`);
    const e = JSON.parse(r.body);

    if(e.code === 0){
      cache.set(key, JSON.stringify(e.data), 3600*12);
      return e.data;
    }
    
    return null;
  },
  hotword: async () => {
    const key = `hotword`;
    const c: string | undefined = cache.get(key);

    if(c) return JSON.parse(c)

    const r = await got(`http://s.search.bilibili.com/main/hotword`);
    const e = JSON.parse(r.body);

    if(e.code === 0){
      cache.set(key, JSON.stringify(e.list), 3600);
      return e.list;
    }
    
    return null;
  },
  bangumi: {
    timeline: async () => {
      const key = `bangumi_timeline`;
      const c: string | undefined = cache.get(key);

      if(c) return JSON.parse(c)

      const r = await got(`https://bangumi.bilibili.com/web_api/timeline_global`);
      const e = JSON.parse(r.body);

      if(e.code === 0){
        cache.set(key, JSON.stringify(e.result), 3600);
        return e.result;
      }
      
      return null;
    },
    today: async () => {
      const result = await bili.bangumi.timeline();
      if(result) {
        const date = new Date();
        const today = `${date.getMonth() + 1}-${date.getDate()}`;

        let data = null;

        Object.values(result).forEach((e: any) => {
          if(e.date === today) {
            data = e;
          }
        });
        
        return data;
      } else {
        return null;
      }
    }
  }
}