import got from 'got'
import config from '../../config'
import * as Ran from '../../lib/api'

const makeUrl = async (target: String, center: String, start: String, stop: String, step: String, zoom: Number) => {
  const url = `https://api.peer.ink/api/v1/jpl/image?target=${target}&center=${center}&start=${start}&stop=${stop}&step=${step}&zoom=${zoom}&iirose.png`
  const resp = await got.get(url)
  if (resp.body.length > 1024) return url
  return '[JPL Hroizons] 查询失败'
}

Ran.command(/^\.jpl (.*) (.*) (.*) (.*) (.*) (\d+)$/, 'jpl.draw', async (m, e, reply) => {
  const target = m[1]
  const center = m[2]
  const start = m[3]
  const stop = m[4]
  const step = m[5]
  const zoom = Number(m[6])

  const url = await makeUrl(target, center, start, stop, step, zoom)
  reply(url, config.app.color)
})
