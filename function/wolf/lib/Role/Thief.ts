import def, { User } from './default'
import * as Ran from '../../../../lib/api'
import { Role, RoleList } from '../role'

export default class Thief extends def {
  constructor (user: User) {
    super(user)
    this.roleId = 'Thief'

    this.event.on('gamestart', game => {
      game.registerHook('night', '小偷', 1, async game => {
        if (!this.isAlive) return
        const myid = game.getIDByUid(this.user.uid)

        const targetId = await game.createSelect(Number(myid), '现在开始选择一个人并偷取他的身份', 30e3)

        if (targetId === -1) return

        if (Math.random() >= 0.5) {
          const self = game.Roles[Number(myid)]
          const target = game.Roles[Number(targetId)]

          // @ts-ignore
          const SelfRole = Role[self.roleId]
          // @ts-ignore
          const TargetRole = Role[target.roleId]

          game.replace(Number(myid), new TargetRole(this.user))
          game.replace(Number(targetId), new SelfRole(target.user))

          Ran.method.sendPrivateMessage(target.user.uid, `你的身份被偷了，你现在是 ${RoleList[self.roleId].name}`)

          if (target.roleId === 'Fool') Ran.method.sendPrivateMessage(this.user.uid, `身份偷取成功，你现在是 ${RoleList.Seer.name}`)
          if (target.roleId !== 'Fool') Ran.method.sendPrivateMessage(this.user.uid, `身份偷取成功，你现在是 ${RoleList[target.roleId].name}`)
          this.user.score += 0.08 // 偷身份 +0.08
        } else {
          Ran.method.sendPrivateMessage(this.user.uid, '身份偷取失败')
        }
      })
    })
  }
}
