import { User } from './default'
import WW from './WW'

export default class AlphaWolf extends WW {
  constructor (user: User) {
    super(user)
    this.roleId = 'AlphaWolf'
  }
}
