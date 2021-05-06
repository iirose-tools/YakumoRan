/* eslint-disable no-undef */
import '../index'
import { commands } from '../lib/api'

test('bili.video.aid', async () => {
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    commands['bili.video.aid'](['av7', 'a', 'v', '7'], {}, (msg, color) => {
      expect(msg).toMatch(/BV1xx411c7m9/)
      resolve()
    })
  })
}, 5000)

test('bili.video.bvid', async () => {
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    commands['bili.video.bvid'](['BV1xx411c7m9', '1xx411c7m9'], {}, (msg, color) => {
      expect(msg).toMatch(/av7/)
      resolve()
    })
  })
}, 5000)

test('bili.hotword', async () => {
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    commands['bili.hotword']([], {}, (msg, color) => {
      expect(msg).toMatch(/1\./)
      resolve()
    })
  })
}, 5000)

test('bili.bangumi.today', async () => {
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    commands['bili.bangumi.today']([], {}, (msg, color) => {
      expect(msg).toMatch(/今天是 星期 \S+, 将有 \d+ 部新番放送！/)
      resolve()
    })
  })
}, 5000)
