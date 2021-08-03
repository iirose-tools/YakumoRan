import got from 'got'
import logger from '../../../../lib/logger'

interface Rank {
  uid: string,
  point: number
}

const user = {
  writeResult: async (game: string, uid: string, role: string, weights: number, status: boolean) => {
    try {
      await got.get('https://api.peer.ink/api/v1/iirose/wolf/write', {
        searchParams: {
          game, uid, role, status, weights
        }
      })
    } catch (error) {
      logger('Wolf').info('数据上报失败', error)
    }
  },
  getRank: async (q: number): Promise<Rank[]> => {
    const result: any = await got.get('https://api.peer.ink/api/v1/iirose/wolf/rank', {
      searchParams: { q }
    }).json()
    return result.result
  }
}

export default user
