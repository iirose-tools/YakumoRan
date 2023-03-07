import * as api from '../../../../../../lib/api'

export const config = {
  pars: {
    leftBoundarySymbol: '$', // 左边界符号配置
    rightBoundarySymbol: '$' // 右边界符号配置
  },
  dir: api.Data, // 词库缓存路径
  host: 'https://word.bstluo.top/'
}
