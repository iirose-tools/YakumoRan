/* eslint-disable no-undef */
import '../index'
import { commands } from '../lib/api'

test('fun.reply.signal', async () => {
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    commands['fun.reply.signal'](['', '摸'], {
      replyMessage: [{
        username: 'b'
      }],
      username: 'a'
    }, (msg, color) => {
      expect(msg).toMatch(/ \[\*a\*\] {2}摸了 {2}\[\*b\*\]！/)
      resolve()
    })
  })
}, 5000)

test('fun.reply.multi', async () => {
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    commands['fun.reply.multi'](['', '摸了摸', '的头'], {
      replyMessage: [{
        username: 'b'
      }],
      username: 'a'
    }, (msg, color) => {
      expect(msg).toMatch(/ \[\*a\*\] {2}摸了摸 {2}\[\*b\*\] {2}的头！/)
      resolve()
    })
  })
}, 5000)
