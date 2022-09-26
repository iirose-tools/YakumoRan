import * as log4js from 'log4js'

const conf: any = {
  appenders: {
    file: {
      type: 'file',
      filename: 'logs/default',
      alwaysIncludePattern: true,
      pattern: 'yyyy-MM-dd.log'
    },
    console: {
      type: 'console'
    }
  },
  categories: {
    default: {
      appenders: ['file', 'console'],
      level: process.env.LOG_LEVEL || 'info'
    }
  }
}

log4js.configure(conf)

export class Logger {
  public trace: (message: string, ...args: any[]) => void
  public debug: (message: string, ...args: any[]) => void
  public info: (message: string, ...args: any[]) => void
  public warn: (message: string, ...args: any[]) => void
  public error: (message: string, ...args: any[]) => void
  public fatal: (message: string, ...args: any[]) => void

  constructor(category: string) {
    const logger = log4js.getLogger(category)
    this.trace = logger.trace.bind(logger)
    this.debug = logger.debug.bind(logger)
    this.info = logger.info.bind(logger)
    this.warn = logger.warn.bind(logger)
    this.error = logger.error.bind(logger)
    this.fatal = logger.fatal.bind(logger)
  }
}
