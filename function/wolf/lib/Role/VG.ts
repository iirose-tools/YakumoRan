import def, { User } from './default'

export default class VG extends def {
  constructor (user: User) {
    super(user)
    this.roleId = 'VG'
  }
}
