import def, { User } from './default'
import * as Ran from '../../../../lib/api'
import { RoleList } from '../role'
import randomNumber from 'random-number-csprng'

export default class Fool extends def {
  constructor (user: User) {
    super(user)
    this.roleId = 'Fool'

    this.event.on('gamestart', game => {
      game.registerHook('night', '笨蛋先知', 998, async game => {
        if (!this.isAlive) return
        const myid = game.getIDByUid(this.user.uid)

        const target = await game.createSelect(Number(myid), '现在开始选择一个人并查看他的身份', 30e3)
        if (target === -1) return Ran.method.sendPrivateMessage(this.user.uid, '你选择了跳过')

        const roleId: string = game.Roles[await randomNumber(0, game.Roles.length - 1)].roleId
        Ran.method.sendPrivateMessage(this.user.uid, `他的身份是 ${RoleList[roleId].name}`)
      })
    })
  }
}
