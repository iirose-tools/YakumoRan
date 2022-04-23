import axios from 'axios'
import NodeCache from 'node-cache'

const cache: NodeCache = new NodeCache()

export const bili = {
  video_aid: async (aid: string) => {
    const key = `video_${aid}`
    const c: string | undefined = cache.get(key)

    if (c) return JSON.parse(c)

    const resp = await axios.get(`http://api.bilibili.com/x/web-interface/view?aid=${aid}`)
    const data = resp.data

    if (data.code === 0) {
      cache.set(key, JSON.stringify(data.data), 3600 * 12)
      return data.data
    }

    return null
  },
  video_bvid: async (bvid: string) => {
    const key = `video_${bvid}`
    const c: string | undefined = cache.get(key)

    if (c) return JSON.parse(c)

    const resp = await axios.get(`http://api.bilibili.com/x/web-interface/view?bvid=${bvid}`)
    const data = resp.data

    if (data.code === 0) {
      cache.set(key, JSON.stringify(data.data), 3600 * 12)
      return data.data
    }

    return null
  },
  audio: async (sid: string) => {
    const key = `audio${sid}`
    const c: string | undefined = cache.get(key)

    if (c) return JSON.parse(c)

    const resp = await axios.get(`https://www.bilibili.com/audio/music-service-c/web/song/info?sid=${sid}`)
    const data = resp.data

    if (data.code === 0) {
      cache.set(key, JSON.stringify(data.data), 3600 * 12)
      return data.data
    }

    return null
  },
  hotword: async () => {
    const key = 'hotword'
    const c: string | undefined = cache.get(key)

    if (c) return JSON.parse(c)

    const resp = await axios.get('http://s.search.bilibili.com/main/hotword')
    const data = resp.data

    if (data.code === 0) {
      cache.set(key, JSON.stringify(data.list), 3600)
      return data.list
    }

    return null
  },
  bangumi: {
    timeline: async () => {
      const key = 'bangumi_timeline'
      const c: string | undefined = cache.get(key)

      if (c) return JSON.parse(c)

      const resp = await axios.get('https://bangumi.bilibili.com/web_api/timeline_global')
      const data = resp.data

      if (data.code === 0) {
        cache.set(key, JSON.stringify(data.result), 3600)
        return data.result
      }

      return null
    },
    today: async () => {
      const result = await bili.bangumi.timeline()
      if (result) {
        const date = new Date()
        const today = `${date.getMonth() + 1}-${date.getDate()}`

        let data = null

        Object.values(result).forEach((item: any) => {
          if (item.date === today) {
            data = item
          }
        })

        return data
      } else {
        return null
      }
    }
  }
}
