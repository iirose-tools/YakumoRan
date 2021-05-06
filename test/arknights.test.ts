/* eslint-disable no-undef */
import '../index'
import { commands } from '../lib/api'

test('arknights.query.item', async () => {
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    commands['arknights.query.item'](['', '碳素组'], {}, (msg, color) => {
      expect(msg).toMatch(/碳素组/)
      resolve()
    })
  })
}, 5000)

test('arknights.query.drops', async () => {
  await new Promise<void>((resolve, reject) => {
    let i = 0
    // @ts-ignore
    commands['arknights.query.drops'](['', '碳素组'], {}, (msg, color) => {
      i++
      if (i === 1) return
      expect(msg).toMatch(/碳素组/)
      resolve()
    })
  })
}, 5000)
