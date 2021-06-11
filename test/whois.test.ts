/* eslint-disable no-undef */
import '../index'
import { commands } from '../lib/api'

test('whois.do', async () => {
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    commands['whois.do'](['', 'github.com'], {}, (msg, color) => {
      expect(msg).toMatch(/https:\/\/pastebin.ubuntu.com/)
      resolve()
    })
  })
}, 5000)
