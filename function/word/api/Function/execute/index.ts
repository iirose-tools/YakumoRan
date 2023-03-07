import * as api from '../../Tools/index'
import { config } from '../../Function/Config/conventional'

// next() 代表此条词库执行失败，申请换一条
import { next } from '../../Driver/api/index'

const dir = config.dir

// 苏苏的随机数生成姬
const random = (n: number, m: number) => { return Math.floor(Math.random() * (m - n + 1) + n) }

// 函数包
export const funcPack:any = {
  测试: (inData: any, playData: any) => {
    // 当发现有测试语句的时候会触发这个
    if (inData[1] === '1') { return next() }
    return inData[1]
  },
  添加: (inData: any, playData: any) => {
    console.log(inData)
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
      return inData[2]
    } else {
      return next()
    }
  }
  /*,
  延迟: (inData: any, playData: any) => {
    const cache = playData.cache
    const cdTime = inData[1]
    const overTime = Date.now() + cdTime
    const who = inData[2] ? inData[2] : playData.mid

    // 任务延迟也是分格存储
    const playConfigTemp = api.command.getjson(dir, 'wordConfig', who)
    if (!playConfigTemp.time) { playConfigTemp.time = {} }
    if (!playConfigTemp.time[cache]) { playConfigTemp.time[cache] = {} }

    const timeTemp = playConfigTemp.time
  }
  */

  // 概率
  // 延迟
  // 鉴权
  // 判断
  // 我ID
  // 我NAME
  // 对I
  // 对N
  // 音频
  // 视频
  // 禁言
  // 踢人
  // 黑名
  // 切除
  // 主动
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
  cache: '',
  mid: '',
  mname: '',
  yid: '',
  yname: '',
  data: {
    唯一标识: {玩家信息}
  }
}

inData = [此回答的唯一标识, 参数1, 参数2 .....]
*/
