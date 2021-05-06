/* eslint-disable no-undef */
import '../index'
import permission from '../function/permission/permission'
import { commands } from '../lib/api'
import { onSend } from '../lib/utils'

test('vtbmusic.cut', async () => {
  await new Promise<void>((resolve, reject) => {
    try { permission.users.addPermission('user', 'vtbmusic.cut') } catch (e) {}

    // @ts-ignore
    commands['vtbmusic.cut']([], { uid: 'user' }, (msg, color) => {
      expect(msg).toBe('cut')
      resolve()
    })
  })
}, 5000)

test('vtbmusic.play.default', async () => {
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    commands['vtbmusic.play.default']([], { uid: 'user' }, (msg, color) => {
      expect(1).toBe(0)
      resolve()
    })
    onSend(/m__4=/, () => {
      expect(1).toBe(1)
      resolve()
    })
  })
}, 1e4)

test('vtbmusic.play', async () => {
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    commands['vtbmusic.play'](['', 'KING'], { uid: 'user' }, (msg, color) => {
      expect(1).toBe(0)
      resolve()
    })
    onSend(/m__4=/, () => {
      expect(1).toBe(1)
      resolve()
    })
  })
}, 1e4)
