import def, { User } from './default'
import * as Ran from '../../../../lib/api'
import { WolfLock, WolfRoleList } from '../utils'
import Mage from './Mage'

export default class WW extends def {
  constructor (user: User) {
    super(user)
    this.roleId = 'WW'

    this.event.on('gamestart', game => {
      const roles: {
        [index: string]: def[]
      } = {}

      for (const role of game.Roles) {
        if (!roles[role.roleId]) roles[role.roleId] = []
        roles[role.roleId].push(role)
      }

      const list: string[] = []

      if (roles.WW) roles.WW.forEach(e => list.push(` [*${e.user.username}*] `))
      if (roles.AlphaWolf) roles.AlphaWolf.forEach(e => list.push(` [*${e.user.username}*] `))

      // 告诉狼人队友是谁
      Ran.method.sendPrivateMessage(this.user.uid, [
        '您的队友是',
        ...list
      ].join('\n'))

      game.registerHook('day', '狼人', 999, async game => {
        try {
          WolfLock.unlock()
        } catch (error) { }
      })

      game.registerHook('night', '狼人', 999, async game => {
        if (!this.isAlive) return
        // 尝试拿锁
        if (WolfLock.tryLock()) {
          // 创建投票
          const votes = await game.createVote(WolfRoleList, '现在开始投票选择一个人并吃掉他', 60e3, true)
          if (votes.length === 0) {
            return roles.WW.forEach(user => {
              Ran.method.sendPrivateMessage(user.user.uid, '公投未能得出结论')
            })
          }

          if (votes.length > 1 && votes[0].vote === votes[1].vote) {
            return roles.WW.forEach(user => {
              Ran.method.sendPrivateMessage(user.user.uid, '公投未能得出结论')
            })
          }

          const tmp: any[] = []
          WolfRoleList.forEach(role => tmp.push(game.getUserByRole(role).filter(e => e.isAlive)))
          const wolfLen = Array.from(new Set(tmp.flat())).length

          const targetId = Number(votes[0].id)
          const myid = Number(game.getIDByUid(this.user.uid))

          Ran.method.sendPrivateMessage(this.user.uid, `选择结束，选中了 ${game.Roles[targetId].user.username}`)

          if (game.Roles[targetId].roleId === 'Hunter' && wolfLen === 1) {
            // 如果只有一只狼就直接杀死狼
            game.kill('Hunter2', myid)
            game.Roles[targetId].flag.use = true
            game.Roles[targetId].user.score += 0.05
          } else if (game.Roles[targetId].roleId === 'Hunter' && wolfLen !== 1 && Math.random() < 0.7) {
            // 70%的概率可以杀死一匹狼
            game.kill('Hunter2', myid)
            game.Roles[targetId].flag.use = true
            game.Roles[targetId].user.score += 0.1

            // 然后继续走正常的流程
            // @ts-ignore
            const mage: Mage = game.getUserByRole('Mage')[0]

            if (!mage) return game.kill('WW', targetId) // 没有女巫就跳过

            const isSave = await mage.useSave(game.Roles[targetId].user.username)
            if (!isSave) {
              game.kill('WW', targetId)
              // 鲨人 +0.05
              WolfRoleList.forEach(role => {
                for (const index in game.Roles) {
                  if (game.Roles[index].roleId === role) {
                    game.Roles[index].user.score += 0.05
                  }
                }
              })
            }
          } else if (Math.random() < 0.2 && game.getUserByRole('AlphaWolf').length > 0) {
            // 变成狼
            Ran.method.sendPrivateMessage(game.Roles[targetId].user.uid, '正当狼群准备咬死你的时候，头狼站了出来拦住了大家，并对你下了诅咒，现在你也成为了狼群的一份子')
            game.replace(targetId, new WW(game.Roles[targetId].user))
            game.playerChange()
            // 感染 +0.08
            WolfRoleList.forEach(role => {
              for (const index in game.Roles) {
                if (game.Roles[index].roleId === role) {
                  game.Roles[index].user.score += 0.08
                }
              }
            })
          } else {
            // @ts-ignore
            const mage: Mage = game.getUserByRole('Mage')[0]

            if (!mage) return game.kill('WW', targetId) // 没有女巫就跳过

            const isSave = await mage.useSave(game.Roles[targetId].user.username)
            if (!isSave) {
              game.kill('WW', targetId)
              // 鲨人 +0.05
              WolfRoleList.forEach(role => {
                for (const index in game.Roles) {
                  if (game.Roles[index].roleId === role) {
                    game.Roles[index].user.score += 0.05
                  }
                }
              })
            }
          }
        }
      })
    })
  }
}
