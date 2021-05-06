/* eslint-disable no-undef */
import '../index'
import { commands } from '../lib/api'

test('dice.do', async () => {
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    commands['dice.do'](['', '1', 'd', '6'], {}, (msg, color) => {
      expect(msg).toMatch(/1\./)
      resolve()
    })
  })
}, 5000)
