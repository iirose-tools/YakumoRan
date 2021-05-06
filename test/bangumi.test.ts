/* eslint-disable no-undef */
import '../index'
import { commands } from '../lib/api'

test('bangumi.watching', async () => {
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    commands['bangumi.watching'](['', 'theresaqwq'], {}, (msg, color) => {
      expect(msg).toMatch(/在看的番剧/)
      resolve()
    })
  })
}, 5000)
