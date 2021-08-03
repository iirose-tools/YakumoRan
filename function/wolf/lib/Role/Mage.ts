import def, { User } from './default'
import * as Ran from '../../../../lib/api'
import { roleTools } from '../game'
import logger from '../../../../lib/logger'

export default class Mage extends def {
  constructor (user: User) {
    super(user)
    this.roleId = 'Mage'

    this.flag.kill = true // 毒药
    this.flag.save = true // 解药
    this.flag.use = false // 是否使用了药

    this.event.on('gamestart', async game => {
      game.registerHook('day', '女巫', 999, async () => {
        this.flag.use = false
      })

      game.registerHook('night', '女巫', 2, async game => {
        if (!this.isAlive) return '' // 如果死亡就直接跳过
        if (!this.flag.kill) return '' // 如果鲨过人就直接跳过
        if (this.flag.use) return '' // 如果使用过其他药就直接跳过

        // 获取自己的id
        const myid = game.getIDByUid(this.user.uid)

        const target = await game.createSelect(Number(myid), '现在开始投票选择一个人并投放毒药', 30e3)

        if (target === -1) return Ran.method.sendPrivateMessage(this.user.uid, '选择超时!')

        // 开始鲨人
        const result = game.kill('Mage', Number(target))

        if (roleTools.getType(game.Roles[Number(target)].roleId) === 'Human') {
          // 鲨人类 -0.2
          this.user.score -= 0.2
        } else {
          // 鲨其他阵营 +0.2
          this.user.score += 0.2
        }

        if (result) {
          Ran.method.sendPrivateMessage(this.user.uid, '你成功毒死了对方')
          this.flag.use = true
        }
        if (!result) return Ran.method.sendPrivateMessage(this.user.uid, '下毒失败')
        this.flag.kill = false
      })
    })
  }

  useSave (username: string) {
    return new Promise((resolve, reject) => {
      if (!this.isAlive) return resolve(false)
      if (!this.flag.save) return resolve(false)
      if (this.flag.use) return resolve(false)

      logger('Wolf [Mage]').info('正在询问是否救人...')

      const flag = {
        skip: false
      }

      // 处理超时
      setTimeout(() => {
        if (flag.skip) return
        resolve(false)
      }, 30e3)

      this.event.once('select_YN', select => {
        flag.skip = true
        if (select) {
          this.flag.save = false
          this.flag.use = true
          this.user.score += 0.2 // 救人 +0.2
        }
        resolve(select)
        Ran.method.sendPrivateMessage(this.user.uid, `你选择了 ${select ? '救他' : '不救他'}`)
      })

      Ran.method.sendPrivateMessage(this.user.uid, [
        `昨晚 ${username} 被鲨了，你要救他吗？`,
        '',
        '回复 Y: 拯救他',
        '回复 N: 不救他'
      ].join('\n'))
    })
  }
}
