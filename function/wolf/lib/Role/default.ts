import EventEmitter from 'events'
import * as Ran from '../../../../lib/api'
import logger from '../../../../lib/logger'
import game from '../game'

export interface User {
  uid: string,
  username: string,
  score: number,
  mark: string
}

interface Event extends EventEmitter {
  on(name: 'gamestart', callback: (game: game) => void): this
  on(name: 'death', callback: (role: string, game: game) => void): this
  on(name: 'select_user', callback: (id: number) => void): this
  on(name: 'select_YN', callback: (input: string) => void): this
  on(name: 'over', callback: () => void): this

  once(name: 'gamestart', callback: (game: game) => void): this
  once(name: 'death', callback: (role: string, game: game) => void): this
  once(name: 'select_user', callback: (id: number) => void): this
  once(name: 'select_YN', callback: (input: boolean) => void): this
  once(name: 'over', callback: () => void): this
}

class Role {
  public user: User
  public roleId: string
  public event: Event
  public isAlive: boolean
  public flag: any

  constructor (user: User) {
    this.isAlive = true
    this.user = user
    this.roleId = ''
    this.event = new EventEmitter()
    this.flag = {}

    Ran.Event.on('PrivateMessage', event => {
      if (event.uid !== this.user.uid) return
      const msg = event.message.trim()
      if (/^\d+$/.test(msg)) {
        logger('Wolf [Event]').info(`${this.user.username} 选择了 ${msg}`)
        this.event.emit('select_user', Number(msg))
      } else if (/^(Y|N)$/.test(msg)) {
        logger('Wolf [Event]').info(`${this.user.username} 选择了 ${msg}`)
        const isY = msg === 'Y'
        this.event.emit('select_YN', isY)
      }
    })

    Ran.Event.on('PublicMessage', event => {
      if (event.uid !== this.user.uid) return
      const msg = event.message.trim()
      if (msg === 'over') {
        logger('Wolf [Event]').info(`${this.user.username} 发送了 over`)
        this.event.emit('over')
      }
    })
  }
}

export default Role
