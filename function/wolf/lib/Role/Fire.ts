import def, { User } from './default'
import * as Ran from '../../../../lib/api'

export default class Fire extends def {
  constructor (user: User) {
    super(user)
    this.roleId = 'Fire'

    this.event.on('gamestart', game => {
      game.registerHook('night', '纵火犯', 999, async game => {
        if (!this.isAlive) return '' // 如果死亡就直接跳过
        // 获取自己的id
        const myid = game.getIDByUid(this.user.uid)

        const target = await game.createSelect(Number(myid), '现在开始选择一个人并烧掉他家', 30e3, true)
        game.kill('Fire', Number(target))
        this.user.score += 0.05 // 鲨人 +0.05
        Ran.method.sendPrivateMessage(this.user.uid, '你成功把他家烧了')
      })
    })
  }
}
