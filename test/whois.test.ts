/* eslint-disable no-undef */
import '../index'
import { commands } from '../lib/api'

test('whois.ip', async () => {
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    commands['whois.ip'](['', '1.1.1.1'], {}, (msg, color) => {
      expect(msg).toMatch(/https:\/\/pastebin.ubuntu.com/)
      resolve()
    })
  })
}, 5000)

test('whois.asn', async () => {
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    commands['whois.asn'](['', '4314'], {}, (msg, color) => {
      expect(msg).toMatch(/https:\/\/pastebin.ubuntu.com/)
      resolve()
    })
  })
}, 5000)

test('whois.domain', async () => {
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    commands['whois.domain'](['', 'github.com'], {}, (msg, color) => {
      expect(msg).toMatch(/https:\/\/pastebin.ubuntu.com/)
      resolve()
    })
  })
}, 5000)
