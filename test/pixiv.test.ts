/* eslint-disable no-undef */
import '../index'
import { commands } from '../lib/api'

test('pixiv.search', async () => {
  await new Promise<void>((resolve, reject) => {
    let i = 0
    // @ts-ignore
    commands['pixiv.search'](['', '明日方舟'], {}, (msg, color) => {
      i++
      if (i === 1) return
      expect(msg).toMatch(/pix\.3m\.chat/)
      resolve()
    })
  })
}, 5000)

test('pixiv.random', async () => {
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    commands['pixiv.random']([], {}, (msg, color) => {
      expect(msg).toMatch(/https:\/\/api\.peer\.ink\/api\/v1\/pixiv\/wallpaper\/image/)
      resolve()
    })
  })
}, 5000)
