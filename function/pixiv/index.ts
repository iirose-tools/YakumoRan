import got from 'got'
import config from '../../config'
import * as Ran from '../../lib/api'

const limit: any = {}

// 限速
const getLimit = (uid: string, time: number) => {
  if (limit[uid]) return false

  limit[uid] = true
  setTimeout(() => {
    delete limit[uid]
  }, time)
  return true
}

const getRandomInt = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n) }

const parserTag = (tags: any): string[] | false => {
  const result = []

  const items: any = Object.values(tags)
  for (const item of items) {
    const tag = item.translated_name || item.name
    result.push(tag)
  }
  return result
}

const pixivSearch = async (word: string) => {
  const illusts = []
  const resp = []
  for (let i = 1; i < 5; i++) {
    resp.push(got.get('https://api.kyomotoi.moe/api/pixiv/search', { searchParams: { word, page: i } }))
  }
  const r = (await Promise.all(resp)).flat().map(e => { return JSON.parse(e.body).illusts }).flat()
  const tmp = Object.values(r).filter((e: any) => {
    if (e.total_bookmarks > 300) return true
    return false
  })

  for (const item of tmp) {
    if (item.sanity_level > 4) continue
    illusts.push(item)
  }
  return illusts
}

Ran.command(/^搜图(.*)$/, 'pixiv.search', async (m, e, reply) => {
  if (config.function.pixiv.disabled) return reply('[Pixiv] 功能未启用...', config.app.color)
  try {
    if (!getLimit(e.uid, 10e3)) return
    reply('[Pixiv] Searching...', config.app.color)
    const word: string = m[1].trim()

    const illusts = await pixivSearch(word)

    if (illusts.length === 0) return reply('[Pixiv] 没有搜索到任何结果', config.app.color)

    const artwork: any = illusts[getRandomInt(0, illusts.length - 1)]
    const tags = parserTag(artwork.tags)
    const url = (artwork.meta_pages.length > 0 ? artwork.meta_pages[0].image_urls.original : artwork.meta_single_page.original_image_url).replace('i.pximg.net', 'pix.3m.chat')

    if (!tags) return reply('[Pixiv] 没有搜索到任何结果', config.app.color)

    reply([
      `[${url}#e]`,
      artwork.title,
      `id: ${artwork.id}`,
      'tags: ',
      tags.map(e => `🏷️${e}`).join('  ')
    ].join('\n'), config.app.color)
  } catch (error) {
    reply('[Pixiv] 没有搜索到任何结果', config.app.color)
  }
})

Ran.command(/^搜图$/, 'pixiv.random', async (m, e, reply) => {
  reply(`[https://api.peer.ink/api/v1/pixiv/wallpaper/image?t=${new Date().getTime()}&a.jpg#e]`, config.app.color)
})
