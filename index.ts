import axios from 'axios'
import logger from './lib/logger'
import pack from './package.json'

const init = async () => {
  logger('Core').info('正在启动...')

  await import('./lib/functions')
  await import('./lib/core')
}

process.on('uncaughtException', (err: any, origin: any) => {
  logger('uncaughtException').error(err, origin)
  process.exit(127)
})

init()
