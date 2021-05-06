/* eslint-disable no-undef */
import '../index'
import permission from '../function/permission/permission'
import { commands } from '../lib/api'

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
