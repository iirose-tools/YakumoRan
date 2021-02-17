import * as mm from 'music-metadata';
import got from 'got';

const random = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n); };

export const vtbmusic = {
  getMusicInfo: async (url: string): Promise<{ duration: number, bitrate: number }> => {
    const buf = Buffer.from((await got(url)).rawBody);
    const result = await mm.parseBuffer(buf);
    return {
      duration: Number(result.format.duration),
      bitrate: Math.round(Number(result.format.bitrate)/1e3)
    };
  },
  getCdnList: async () => {
    const data = JSON.parse((await got('https://api.aqua.chat/v1/GetCDNList', {
      method: 'POST',
      headers: {
        "User-Agent": "iirose/YakumoRan",
        "Content-Type": "application/json;charset=UTF-8"
      },
      body: `{"PageIndex":1,"PageRows":10}`
    })).body).Data;
    
    const result: any = {};
    
    Object.values(data).forEach((e: any) => {
      result[e.name] = e;
    })

    return result;
  },
  parseMusic: async (music: any) => {
    try {
      const CDNList = await vtbmusic.getCdnList();

      const url = {
        music: `${CDNList[music.CDN.indexOf(':') === -1 ? music.CDN : music.CDN.split(':')[1]].url}${music.Music}`,
        cover: `${CDNList[music.CDN.indexOf(':') === -1 ? music.CDN : music.CDN.split(':')[0]].url}${music.CoverImg}`
      };

      const info = await vtbmusic.getMusicInfo(url.music);

      const data = {
        id: music.Id,
        music: url.music,
        cover: url.cover,
        duration: info.duration,
        bitrate: info.bitrate,
        title: music.OriginName,
        signer: music.VocalName
      }

      return data;
    } catch (error) {
      return null;
    }
  },
  search: async (keyword: string) => {
    try {
      const body = {
        pageIndex: 1,
        pageRows: 1,
        search: {
          condition: "OriginName",
          keyword: keyword
        }
      };
  
      const result = JSON.parse((await got('https://api.aqua.chat/v1/GetMusicList', {
        method: "post",
        headers: {
          "User-Agent": "iirose/YakumoRan",
          "Content-Type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify(body)
      })).body);

      if(Object.values(result.Data).length === 0) return null

      const music: any = Object.values(result.Data);

      return vtbmusic.parseMusic(music[random(0, music.length - 1)]);
    } catch (error) {
      console.log(error)
      return null;
    }
  },
  hotMusic: async () => {
    try {
      const body = {
        pageIndex: 1,
        pageRows: 10
      };

      const result = JSON.parse((await got('https://api.aqua.chat/v1/GetHotMusicList', {
        method: "post",
        headers: {
          "User-Agent": "iirose/YakumoRan",
          "Content-Type": "application/json;charset=UTF-8"
        },
        body: JSON.stringify(body)
      })).body);

      const music = Object.values(result.Data);

      return vtbmusic.parseMusic(music[random(0, music.length - 1)]);
    } catch (error) {
      return null;
    }
  }
}