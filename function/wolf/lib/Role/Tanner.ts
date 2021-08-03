import def, { User } from './default'
import * as Ran from '../../../../lib/api'

export default class Tanner extends def {
  constructor (user: User) {
    super(user)
    this.roleId = 'Tanner'

    this.event.on('death', (role, game) => {
      if (role === 'Vote') {
        this.isAlive = true
        game.Roles.forEach((item, index) => {
          if (item.user.uid === this.user.uid) return
          game.Roles[index].isAlive = false
          Ran.method.sendPrivateMessage(game.Roles[index].user.uid, '糟糕！你已被圣战者炸死。')
        })

        game.playerChange()
      }
    })
  }
}
