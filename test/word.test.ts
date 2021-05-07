/* eslint-disable no-undef */
import '../index'
import permission from '../function/permission/permission'
import { commands } from '../lib/api'

test('word.add', async () => {
  await new Promise<void>((resolve, reject) => {
    try { permission.users.addPermission('user', 'word.op') } catch (e) {}

    // @ts-ignore
    commands['word.add'](['', '测试', '测试成功'], { uid: 'user' }, (msg, color) => {
      expect(msg).toMatch('测试成功')
      resolve()
    })
  })
}, 5000)

test('word.delete.all', async () => {
  await new Promise<void>((resolve, reject) => {
    try { permission.users.addPermission('user', 'word.op') } catch (e) {}

    // @ts-ignore
    commands['word.delete.all'](['', '测试'], { uid: 'user' }, (msg, color) => {
      expect(msg).toMatch('删除成功')
      resolve()
    })
  })
}, 5000)

test('word.delete.one', async () => {
  await new Promise<void>((resolve, reject) => {
    try { permission.users.addPermission('user', 'word.op') } catch (e) {}

    // @ts-ignore
    commands['word.delete.one'](['', '测试', '1'], { uid: 'user' }, (msg, color) => {
      expect(msg).toMatch('删除成功')
      resolve()
    })
  })
}, 5000)
