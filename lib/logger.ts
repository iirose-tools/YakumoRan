import log4js from 'log4js'
import { isTest } from './utils'
import config from '../config'

const conf: any = {
  appenders: {
    defaultFile: {
      type: 'dateFile',
      filename: 'logs/default',
      alwaysIncludePattern: true,
      pattern: 'yyyy-MM-dd.log'
    },
    testFile: {
      type: 'dateFile',
      filename: 'logs/test',
      alwaysIncludePattern: true,
      pattern: 'yyyy-MM-dd.log'
    },
    console: {
      type: 'console'
    }
  },
  categories: {
    default: {
      appenders: [],
      level: config.logger.level
    }
  }
}

if (isTest) {
  conf.categories.default.appenders.push('testFile')
} else {
  conf.categories.default.appenders.push('defaultFile')
  conf.categories.default.appenders.push('console')
}

log4js.configure(conf)

export default log4js.getLogger
