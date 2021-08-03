import def, { User } from './default'
import * as Ran from '../../../../lib/api'
import { RoleList } from '../role'

export default class Seer extends def {
  constructor (user: User) {
    super(user)
    this.roleId = 'Seer'

    this.event.on('gamestart', game => {
      game.registerHook('night', '先知', 998, async game => {
        if (!this.isAlive) return
        const myid = game.getIDByUid(this.user.uid)

        const target = await game.createSelect(Number(myid), '现在开始选择一个人并查看他的身份', 30e3)

        if (target === -1) return Ran.method.sendPrivateMessage(this.user.uid, '已经选择跳过本回合')

        const roleId: string = game.Roles[Number(target)].roleId
        Ran.method.sendPrivateMessage(this.user.uid, `他的身份是 ${RoleList[roleId].name}`)
        this.user.score += 0.02 // 查看身份 +0.02
      })
    })
  }
}
