import def, { User } from './default'
import * as Ran from '../../../../lib/api'
import { RoleList } from '../role'

export default class AppS extends def {
  constructor (user: User) {
    super(user)
    this.roleId = 'AppS'

    this.event.on('gamestart', game => {
      game.registerHook('night', '先知学徒', 998, async game => {
        if (!this.isAlive) return
        const myid = game.getIDByUid(this.user.uid)
        const Seer = game.getUserByRole('Seer')[0]

        if (Seer && Seer.isAlive) return '' // 如果先知没死就不进行任何操作

        const target = await game.createSelect(Number(myid), '现在开始选择一个人并查看他的身份', 30e3)

        const roleId: string = game.Roles[Number(target)].roleId
        Ran.method.sendPrivateMessage(this.user.uid, `他的身份是 ${RoleList[roleId].name}`)
        this.user.score += 0.02 // 查看身份 +0.02
      })
    })
  }
}
