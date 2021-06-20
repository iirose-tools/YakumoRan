import { EventEmitter } from 'events'
import fs from 'fs'
import path from 'path'
import uuid from 'uuid'
import * as Ran from '../../lib/api'

const MsgEventByUid = new EventEmitter()

Ran.Event.on('PublicMessage', event => {
  MsgEventByUid.emit(event.uid, event.message)
})

const vote = {
  renderOptions: (options: string[]) => {
    const list = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N', 'L', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    const result = options.map((option, index) => {
      return `${list[index]}. ${option}`
    }).join('\n')
    return result
  }
}

class CreateVote {
  private id: string
  private uid: string
  private name: string
  private reply: (msg: string) => void
  private title: string
  private options: string[]
  private time: number

  constructor (uid: string, name: string, reply: (msg: string) => void) {
    this.uid = uid
    this.name = name
    this.reply = reply

    this.id = uuid.v4()

    this.time = 0
    this.title = ''
    this.options = []

    this.inputTime()
  }

  inputTime () {
    MsgEventByUid.once(this.uid, msg => {
      const time = Number(msg)
      if (time > 10080) {
        this.reply('时间必须小于7天（10080分钟）')
        this.inputTime()
      } else if (time < 5) {
        this.reply('时间必须大于5分钟')
        this.inputTime()
      } else {
        this.time = time * 60
        this.inputName()
      }
    })
    this.reply([
      '请输入投票的持续时间',
      '纯数字，单位: 分钟',
      '1小时 = 60分钟',
      '1天 = 1440分钟'
    ].join('\n'))
  }

  inputName () {
    MsgEventByUid.once(this.uid, msg => {
      if (msg.length < 24) {
        this.title = msg
      } else {
        this.inputName()
      }
    })
    this.reply('请输入投票的标题')
  }

  inputOption (n: number = 1) {
    if (n > 10) {
      this.reply('最多只能创建10个选项')
      this.end()
      return
    }
    MsgEventByUid.once(this.uid, msg => {
      if (msg === '结束') return this.end()
      this.options.push(msg)
      this.inputOption(n + 1)
    })
    this.reply(`请输入投票的第 ${n} 个选项的内容 (创建完成请发送 “结束”)`)
  }

  end () {
    this.reply([
      '创建完成，投票内容如下:',
      this.title,
      vote.renderOptions(this.options)
    ].join('\n'))

    this.save()
  }

  save () {
    const data = {
      id: this.id,
      title: this.title,
      time: this.time,
      start: new Date().getTime(),
      options: this.options,
      create: {
        uid: this.uid,
        name: this.name
      }
    }

    fs.promises.writeFile(path.join(Ran.Data, 'vote', `${this.id}.json`), JSON.stringify(data))
  }
}

// eslint-disable-next-line no-unused-vars
const createSession: {
  [index: string]: CreateVote
} = {}

Ran.command(/^新建投票$/, 'vote.create', (m, event, reply) => {
  return reply('[Vote] 没做完')
  // if (createSession[event.uid]) delete createSession[event.uid]
  // createSession[event.uid] = new CreateVote(event.uid, event.username, reply)
})

Ran.command(/^结束$/, 'vote.stop', (m, event, reply) => {
  return reply('[Vote] 没做完')
  // if (createSession[event.uid]) delete createSession[event.uid]
})
