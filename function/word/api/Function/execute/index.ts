import * as api from '../../Tools/index'
import { config } from '../../Function/Config/conventional'
import * as word from '../../index'
// next() 代表此条词库执行失败，申请换一条
import { next } from '../../Driver/api/index'

const dir = config.dir

// 苏苏的随机数生成姬
const random = (n: number, m: number) => { return Math.floor(Math.random() * (m - n + 1) + n) }

// 函数包
export const funcPack:any = {
  添加: (inData: any, playData: any) => {
    const cache = playData.cache
    const reg = /([\s\S]+?)~([\s\S]+?)/
    const main = inData[1]
    let num = inData[2]
    const who = inData[3] ? inData[3] : playData.mid

    // 在缓存的玩家数据如果不存在的话，读取，并初始化它
    /*
    {
      存储格名: {}
    }
    */
    if (!playData.data[who]) { playData.data[who] = api.command.getjson(dir, 'userData', who) }
    if (!playData.data[who][cache]) { playData.data[who][cache] = {} }

    const mData = playData.data[who][cache]
    if (!mData[main]) { mData[main] = 0 }

    if (num.includes('all')) { num.replace('all', mData[main]) }

    if (reg.test(num)) {
      const value = num.match(reg)
      num = random(Number(value[1]), Number(value[2]))
    }

    mData[main] = mData[main] + Number(num)

    return num
  },
  减少: (inData: any, playData: any) => {
    const cache = playData.cache
    const reg = /([\s\S]+?)~([\s\S]+?)/
    const main = inData[1]
    let num = inData[2]
    const who = inData[3] ? inData[3] : playData.mid

    // 在缓存的玩家数据如果不存在的话，读取，并初始化它
    /*
    {
      存储格名: {}
    }
    */
    if (!playData.data[who]) { playData.data[who] = api.command.getjson(dir, 'userData', who) }
    if (!playData.data[who][cache]) { playData.data[who][cache] = {} }
    const mData = playData.data[who][cache]

    if (!mData[main]) { mData[main] = 0 }

    if (num.includes('all')) { num.replace('all', mData[main]) }

    if (reg.test(num)) {
      const value = num.match(reg)
      num = random(Number(value[1]), Number(value[2]))
    }

    mData[main] = mData[main] - Number(num)
    if (mData[main] > 0) { return num }
    return next()
  },
  数值: (inData: any, playData: any) => {
    const cache = playData.cache
    const itemName = inData[1]
    const who = inData[2] ? inData[2] : playData.mid

    if (!playData.data[who]) { playData.data[who] = api.command.getjson(dir, 'userData', who) }
    if (!playData.data[who][cache]) { playData.data[who][cache] = {} }
    const mData = playData.data[who][cache]

    return mData[itemName]
  },
  概率: (inData: any, playData: any) => {
    const value = inData[1]

    if (random(0, 100) <= value) {
      return ''
    } else {
      return next()
    }
  },
  延迟: (inData: any, playData: any) => {
    const cache = playData.cache
    const cdTime = inData[1]
    const nowTime = Date.now()
    const overTime = nowTime + cdTime
    const who = inData[2] ? inData[2] : playData.mid

    // 任务延迟也是分格存储
    const playConfigTemp = api.command.getjson(dir, 'wordConfig', who)
    if (!playConfigTemp.time) { playConfigTemp.time = {} }
    if (!playConfigTemp.time[cache]) { playConfigTemp.time[cache] = {} }

    // 获取当前问的cd
    let timeTemp = playConfigTemp.time[playData.messageId]

    if (!timeTemp) { timeTemp = 0 }

    if (timeTemp <= nowTime) {
      // 如果存储的cd比现在的时间低
      // 重启cd，并执行它
      timeTemp = overTime

      return ''
    } else {
      return next()
    }
  },
  鉴权: (inData: any, playData: any) => {
    const witchPerssion = inData[1]
    const who = inData[2] ? inData[2] : playData.mid

    if (word.permissions.have(witchPerssion, who)) {
      return ''
    } else {
      return next()
    }
  },
  随机: (inData: any, playData: any) => {
    return random(Number(inData[1]), Number(inData[2]))
  },
  判断: (inData: any, playData: any) => {
    const who = inData[4] ? inData[4] : playData.mid
    const cache = playData.cache
    const itemName = inData[1]
    const relationship = inData[2]
    const number = inData[3]

    if (!playData.data[who]) { playData.data[who] = api.command.getjson(dir, 'userData', who) }
    if (!playData.data[who][cache]) { playData.data[who][cache] = {} }

    const mData = playData.data[who][cache]
    if (relationship === '>' && mData[itemName] > Number(number)) { return '' }
    if (relationship === '<' && mData[itemName] < Number(number)) { return '' }
    if (relationship === '=' && mData[itemName] === Number(number)) { return '' }
    if (relationship === '<>' && mData[itemName] !== Number(number)) { return '' }
    if (relationship === '==' && mData[itemName] === number) { return '' }

    return next()
  },
  我I: (inData: any, playData: any) => {
    return playData.mid
  },
  我N: (inData: any, playData: any) => {
    return playData.mname
  },
  你I: (inData: any, playData: any) => {
    return playData.yid
  },
  你N: (inData: any, playData: any) => {
    return playData.yname
  }

  // 音频
  // 视频
  // 禁言
  // 踢人
  // 黑名
  // 切除
  // 创建延迟器
  // 被动
  // 计算

  // 武器
  // 法器
  // 足具
  // 法防
  // 物防
}

/*
playData = {
  cache: '存储格子',
  mid: '触发者id',
  mname: '触发者的昵称',
  yid: '语法中的对方id',
  yname: '语法中的对方昵称',
  messageId: '问句的md5',
  data: {
    唯一标识: {玩家信息}
  }
}
*/
