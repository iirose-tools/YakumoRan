import config from '../../config'
import * as api from '../../lib/api'
import { user } from './api'
import per from '../permission/permission'
try {
  per.users.create('function')
} catch (error) {
}
if (!per.users.hasPermission('function', 'function.bangumi')) {
  api.command(/^(.*)在看啥$/, 'bangumi.watching', async (m, e, reply) => {
    const username: string = m[1]
    const userInfo = await user.userInfo(username)
    const collection = await user.userCollection(username, 'watching')

    const msg: string[] = []

    if (userInfo && collection) {
      msg.push(`=====${userInfo.nickname} 在看的番剧 =====`)
      Object.values(collection).forEach(e => {
        msg.push(`${e.subject.name_cn || e.subject.name}: ${e.ep_status}/${e.subject.eps_count || e.subject.eps || 'unknown'}`)
      })
    } else {
      msg.push('[Bangumi] 查询失败')
    }

    reply(msg.join('\n'), config.app.color)
  })
}
