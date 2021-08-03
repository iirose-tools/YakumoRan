import def, { User } from './default'

export default class Hunter extends def {
  constructor (user: User) {
    super(user)
    this.roleId = 'Hunter'
    this.flag.use = false

    this.event.on('gamestart', game => {
      // 猎人死亡时选择一个人处死
      this.event.on('death', async (role, game) => {
        const myid = game.getIDByUid(this.user.uid)

        const target = await game.createSelect(Number(myid), '现在请选择一个人并开枪打死他', 30e3)

        if (target === -1) return ''

        game.kill('Hunter1', Number(target))
        // 鲨人 +0.05
        this.user.score += 0.05
        this.flag.use = true
      })
    })
  }
}
