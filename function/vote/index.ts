import { EventEmitter } from 'events'
import fs from 'fs'
import path from 'path'
import config from '../../config'
import * as Ran from '../../lib/api'
import permission from '../permission/permission'

interface VoteData {
  id: number, // 投票id
  complete: boolean, // 是否已结束
  title: string, // 标题
  time: number, // 投票时长
  start: number, // 开始时间
  options: string[], // 投票选项
  uidList: string[], // 参与投票的人的uid
  votes: { // 投票
    [index: string]: number
  },
  create: { // 创建者信息
    uid: string,
    name: string
  }
}

const MsgEventByUid = new EventEmitter()

Ran.Event.on('PrivateMessage', event => {
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

const voteMgr = {
  getNextId: () => {
    const idFile = path.join(Ran.Data, 'vote', 'id.dat')
    if (fs.existsSync(idFile)) {
      const id = Number(fs.readFileSync(idFile).toString())
      const nextId = id + 1
      fs.writeFileSync(idFile, nextId.toString())
      return nextId
    } else {
      fs.writeFileSync(idFile, '1')
      return 1
    }
  }
}
class CreateVote {
  private id: number
  private uid: string
  private name: string
  private reply: (msg: string) => void
  private title: string
  private options: string[]
  private time: number

  constructor (uid: string, name: string) {
    this.uid = uid
    this.name = name
    this.reply = (msg: string) => Ran.method.sendPrivateMessage(this.uid, msg, config.app.color)

    this.id = voteMgr.getNextId()

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
        this.inputOption()
      } else {
        this.reply('标题过长(最长24个字)')
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
    const data: VoteData = {
      id: this.id,
      complete: false,
      title: this.title,
      time: this.time,
      start: new Date().getTime() / 1e3,
      options: this.options,
      votes: {},
      uidList: [],
      create: {
        uid: this.uid,
        name: this.name
      }
    }

    fs.promises.writeFile(path.join(Ran.Data, 'vote', `${this.id}.json`), JSON.stringify(data)).then(() => {
      voteList[this.id] = new Vote(this.id)
    })
  }
}

class Vote {
  private data: VoteData

  constructor (id: number) {
    this.data = JSON.parse(fs.readFileSync(path.join(Ran.Data, 'vote', `${id}.json`)).toString())
    if (!this.data.complete) this.start()
    if (this.data.complete) delete voteList[this.data.id] // 如果投票已完成就删除投票
  }

  // 从文件加载投票信息
  load () {
    this.data = JSON.parse(fs.readFileSync(path.join(Ran.Data, 'vote', `${this.data.id}.json`)).toString())
  }

  // 把投票信息写入文件
  async write () {
    await fs.promises.writeFile(path.join(Ran.Data, 'vote', `${this.data.id}.json`), JSON.stringify(this.data))
  }

  // 进行投票
  select (option: string, uid: string) {
    const list = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N', 'L', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    const index = list.indexOf(option.toUpperCase())

    // 投票前的检查
    if (index === -1) return '投票失败：不存在的选项'
    if (!this.data.options[index]) return '投票失败：不存在的选项'
    if (this.data.uidList.includes(uid)) return '投票失败：你已经参加过这个投票了'

    // 记录投票
    this.data.uidList.push(uid)

    // 进行投票
    if (!this.data.votes[option]) this.data.votes[option] = 0
    this.data.votes[option]++

    // 保存数据
    this.write()

    return null
  }

  // 投票结束
  onEnd () {
    this.load()
    const votes = []
    for (const index in this.data.votes) {
      const list = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N', 'L', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
      const count = this.data.votes[index]
      votes.push(`${index}. ${this.data.options[list.indexOf(index)]}: ${count}票`)
    }

    Ran.method.sendPublicMessage([
      '投票结束通知',
      this.data.title,
      ...votes
    ].join('\n'), config.app.color)

    this.data.complete = true
    this.write()

    // 删除内存中的投票
    delete voteList[this.data.id]
  }

  // 开始投票计时
  start () {
    const now = new Date().getTime() / 1e3
    const diff = now - this.data.start
    const time = this.data.time - diff
    if (time > 0) {
      setTimeout(() => this.onEnd(), time * 1e3)
    } else {
      this.onEnd()
    }
  }
}

const voteList: {
  [index: number]: Vote
} = {}

const createSession: {
  [index: string]: CreateVote
} = {}

Ran.command(/^新建投票$/, 'vote.create', (m, event, reply) => {
  if (!permission.users.hasPermission(event.uid, 'vote.create')) return reply('[Vote] 你没有权限这么做')
  if (createSession[event.uid]) delete createSession[event.uid]
  createSession[event.uid] = new CreateVote(event.uid, event.username)
})

Ran.command(/^结束$/, 'vote.stop', (m, event, reply) => {
  if (createSession[event.uid]) delete createSession[event.uid]
})

Ran.command(/^投票列表$/, 'vote.list', async (m, event, reply) => {
  // 读取投票列表
  const dir = path.join(Ran.Data, 'vote')
  const filelist = await fs.promises.readdir(dir)
  const now = new Date().getTime() / 1e3

  // 消息内容
  const msg = []

  for (const file of filelist) {
    if (file === 'id.dat') continue
    const filename = path.join(dir, file)
    const id = file.replace('.json', '')
    const data: VoteData = JSON.parse((await fs.promises.readFile(filename)).toString())
    if (data.complete) continue // 不显示已经结束的投票
    const time = Math.round((data.start + data.time) - now) // 剩余时间（秒）
    msg.push([
      `${data.title}: `,
      `剩余时间: ${time}秒`,
      '',
      vote.renderOptions(data.options),
      `发送 投票${id}你的选项 进行投票, 例如 投票${id}A`
    ].join('\n'))
  }

  reply(msg.join('\n\n===================\n\n'))
})

Ran.command(/^投票(\d+)(\S)$/, 'vote.vote', (m, event, reply) => {
  const id = Number(m[1])
  const option = m[2].toUpperCase()

  if (voteList[id]) {
    const result = voteList[id].select(option, event.uid)
    if (!result) return reply('[Vote] 投票成功')
    reply(`[Vote] ${result}`)
  } else {
    reply('[Vote] 投票不存在或已结束')
  }
})

Ran.Event.on('login', () => {
  fs.promises.readdir(path.join(Ran.Data, 'vote')).then(filelist => {
    for (const file of filelist) {
      if (file === 'id.dat') continue
      const id = Number(file.replace('.json', ''))
      voteList[id] = new Vote(id)
    }
  })
})
