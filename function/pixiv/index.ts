import got from 'got'
import config from '../../config'
import * as Ran from '../../lib/api'

const getRandomInt = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n) }

const parserTag = (tags: any): string[] | false => {
  const blockTags = [
    'R-18',
    'R-18G'
  ]
  const result = []
  const items: any = Object.values(tags)
  for (const item of items) {
    const tag = item.translated_name || item.name
    if (blockTags.includes(tag)) return false
    result.push(tag)
  }
  return result
}

Ran.command(/^搜图(.*)$/, async (m, e, reply) => {
  try {
    const word: string = m[1]
    const resp = await got.get('https://api.obfs.dev/api/pixiv/search', { searchParams: { word } })
    const data = JSON.parse(resp.body)
    const illusts = Object.values(data.illusts)
    const artwork: any = illusts[getRandomInt(0, illusts.length - 1)]
    const tags = parserTag(artwork.tags)
    const url = (artwork.meta_pages.length > 0 ? artwork.meta_pages[0].image_urls.original : artwork.meta_single_page.original_image_url).replace('i.pximg.net', 'pix.3m.chat')

    if (!tags) return reply('[Pixiv] 没有搜索到任何结果', config.app.color)

    reply([
      `[${url}#e]`,
      artwork.title,
      `id: ${artwork.id}`,
      'tags: ',
      tags.map(e => `#${e}`).join('\t')
    ].join('\n'), config.app.color)
  } catch (error) {
    reply('[Pixiv] 没有搜索到任何结果', config.app.color)
  }
})

Ran.command(/^搜图$/, async (m, e, reply) => {
  reply('[https://api.peer.ink/api/v1/pixiv/wallpaper/image?a.jpg#e]', config.app.color)
})