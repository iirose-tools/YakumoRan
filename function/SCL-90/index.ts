import * as Ran from '../../lib/api'
import config from '../../config'
import { EventEmitter } from 'events'
import logger from '../../lib/logger'

interface Session {
  logs: string[],
  index: number
}

const choice = new EventEmitter()

const question: string[] = [
  '头痛',
  '神经过敏，心中不踏实',
  '头脑中有不必要的想法或字句盘旋',
  '头晕或晕倒',
  '对异性的兴趣减退',
  '对旁人责备求全',
  '感到别人能控制您的思想',
  '责怪别人制造麻烦',
  '忘性大',
  '担心自己的衣饰整齐及仪态的端正',
  '容易烦恼和激动',
  '胸痛',
  '害怕空旷的场所或街道',
  '感到自己的精力下降，活动减慢',
  '想结束自己的生命',
  '听到旁人听不到的声音',
  '发抖',
  '感到大多数人都不可信任',
  '胃口不好',
  '容易哭泣',
  '同异性相处时感到害羞不自在',
  '感到受骗，中了圈套或有人想抓住您',
  '无缘无故地突然感到害怕',
  '自己不能控制地大发脾气',
  '怕单独出门',
  '经常责怪自己',
  '腰痛',
  '感到难以完成任务',
  '感到孤独',
  '感到苦闷',
  '过分担忧',
  '对事物不感兴趣',
  '感到害怕',
  '您的感情容易受到伤害',
  '旁人能知道您的私下想法',
  '感到别人不理解您、不同情您',
  '感到人们对您不友好，不喜欢您',
  '做事必须做得很慢以保证做得正确',
  '心跳得很厉害',
  '恶心或胃部不舒服',
  '感到比不上他人',
  '肌肉酸痛',
  '感到有人在监视您、谈论您',
  '难以入睡',
  '做事必须反复检查',
  '难以做出决定',
  '怕乘电车、公共汽车、地铁或火车',
  '呼吸有困难',
  '一阵阵发冷或发热',
  '因为感到害怕而避开某些东西、场合或活动',
  '脑子变空了',
  '身体发麻或刺痛',
  '喉咙有梗塞感',
  '感到前途没有希望',
  '不能集中注意力',
  '感到身体的某一部分软弱无力',
  '感到紧张或容易紧张',
  '感到手或脚发重',
  '想到死亡的事',
  '吃得太多',
  '当别人看着您或谈论您时感到不自在',
  '有一些不属于您自己的想法',
  '有想打人或伤害他人的冲动',
  '醒得太早',
  '必须反复洗手、点数',
  '睡得不稳不深',
  '有想摔坏或破坏东西的想法',
  '有一些别人没有的想法',
  '感到对别人神经过敏',
  '在商店或电影院等人多的地方感到不自在',
  '感到任何事情都很困难',
  '一阵阵恐惧或惊恐',
  '感到公共场合吃东西很不舒服',
  '经常与人争论',
  '单独一人时神经很紧张',
  '别人对您的成绩没有做出恰当的评价',
  '即使和别人在一起也感到孤单',
  '感到坐立不安心神不定',
  '感到自己没有什么价值',
  '感到熟悉的东西变成陌生或不像是真的',
  '大叫或摔东西',
  '害怕会在公共场合晕倒',
  '感到别人想占您的便宜',
  '为一些有关性的想法而很苦恼',
  '您认为应该因为自己的过错而受到惩罚',
  '感到要很快把事情做完',
  '感到自己的身体有严重问题',
  '从未感到和其他人很亲近',
  '感到自己有罪',
  '感到自己的脑子有毛病'
]

const TypeMap: {
  [index: string]: number[]
} = {
  躯体化: [0, 3, 11, 26, 39, 41, 47, 48, 51, 52, 55, 57],
  强迫症状: [2, 8, 11, 27, 37, 44, 45, 40, 54, 64],
  人际关系敏感: [5, 20, 33, 35, 36, 40, 60, 68, 72],
  抑郁: [4, 13, 14, 19, 21, 25, 28, 29, 30, 31, 53, 70],
  焦虑: [1, 16, 22, 23, 38, 56, 71, 77, 79, 85],
  敌对: [11, 23, 62, 66, 73, 80],
  恐怖: [12, 24, 46, 49, 69, 74, 81],
  偏执: [7, 17, 42, 67, 75, 82],
  精神病性: [6, 15, 34, 61, 76, 83, 84, 86, 87, 89],
  其他: [18, 43, 58, 59, 63, 65, 88]
}

const session: {
  [index: string]: Session
} = {}

const SCL90 = {
  init: (uid: string) => {
    logger('SCL90').info(uid, '初始化了测试')
    session[uid] = {
      index: 0,
      logs: []
    }

    Ran.method.sendPrivateMessage(uid, [
      '本测试总共90道选择题，测试结果不完全代表您的实际情况，若需要专业检查请去医院进行',
      'SCL-90 采用 5 级评分，主要评定症状出现的频度，其标如下',
      'A. 从无',
      'B. 很轻',
      'C. 中等',
      'D. 偏重',
      'E. 严重',
      '',
      '阅读完成后，回复 “开始” 正式开始测试'
    ].join('\n'), config.app.color)
  },
  makeReq: (index: number) => {
    return [
      `${index + 1}. ${question[index]}`,
      '',
      'A. 从无',
      'B. 很轻',
      'C. 中等',
      'D. 偏重',
      'E. 严重'
    ].join('\n')
  },
  start: (uid: string) => {
    if (session[uid]) {
      SCL90.next(uid)
      logger('SCL90').info(uid, '开始了测试')
    }
  },
  getType: (index: number) => {
    for (const type in TypeMap) {
      if (TypeMap[type].includes(index)) return type
    }

    return '其他'
  },
  result: (uid: string) => {
    // 阳性项目总分
    let total1 = 0
    // 总分
    let total = 0

    const s: {
      [index: string]: number
    } = {
      躯体化: 0,
      强迫症状: 0,
      人际关系敏感: 0,
      抑郁: 0,
      焦虑: 0,
      敌对: 0,
      恐怖: 0,
      偏执: 0,
      精神病性: 0,
      其他: 0
    }

    const Map: {
      [index: string]: number
    } = {
      A: 1,
      B: 2,
      C: 3,
      D: 4,
      E: 5
    }

    for (const index in session[uid].logs) {
      const c = session[uid].logs[index]
      const score = Map[c.toUpperCase()]
      const type: string = SCL90.getType(Number(index))

      total += score

      if (score >= 2) total1++

      s[type] += score
    }

    const msg = []

    // 计算分数
    for (const type in s) {
      const score = s[type] / (TypeMap[type] ? TypeMap[type].length : 0)

      let result = '正常'
      if (score >= 2 && score < 3) result = '轻度'
      if (score >= 3 && score <= 3.8) result = '中度'
      if (score >= 3.9) result = '重度'

      msg.push(`${type} (${result}): ${score}`)
    }

    logger('SCL90').info(uid, '结束了测试', 'result:', msg, ', 总分: ', total, `, 阳性项目总分: ${total1}`)

    Ran.method.sendPrivateMessage(uid, [
      '以下是您的测试结果',
      `总分：${total}`,
      `阳性项目总分：${total1}`,
      '',
      '因子分: ',
      ...msg,
      '',
      `测试结果: ${total1 >= 43 ? '异常' : '正常'}`,
      `是否为阳性症状：${total >= 160 ? '是' : '否'}`
    ].join('\n'), config.app.color)
  },
  next: (uid: string) => {
    const q = SCL90.makeReq(session[uid].index)

    choice.once(uid, (c: string) => {
      session[uid].logs.push(c)

      if (session[uid].index === 89) {
        SCL90.result(uid)
        return
      }

      setTimeout(() => {
        session[uid].index++
        SCL90.next(uid)
      }, 1e3)
    })

    Ran.method.sendPrivateMessage(uid, q, config.app.color)
  }
}

Ran.Event.on('PrivateMessage', e => {
  const c = ['A', 'B', 'C', 'D', 'E']
  if (c.includes(e.message.trim().toUpperCase())) {
    choice.emit(e.uid, e.message.toUpperCase())
  }
})

Ran.Event.on('PrivateMessage', e => {
  const cmd = e.message.trim().toUpperCase()

  if (cmd === 'SCL90') SCL90.init(e.uid)
  if (cmd === '开始') SCL90.start(e.uid)
})
