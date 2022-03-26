import got from 'got'
import logger from './lib/logger'
import pack from './package.json'

const update = () => {
  logger('Updater').info('正在检查更新...')

  got.get('https://api.peer.ink/api/github/YakumoRan').then(resp => {
    const data = JSON.parse(resp.body)
    if (data.version !== pack.version) {
      logger('Updater').info(`发现了新的版本，版本号为 ${data.version}，请及时更新，链接: https://github.com/iirose-tools/YakumoRan`)
    } else {
      logger('Updater').info('未发现新版本')
    }
  })
}

const init = async () => {
  logger('Core').info('正在启动...')

  update()
  await import('./lib/functions')
  await import('./lib/core')
}

process.on('uncaughtException', (err: any, origin: any) => {
  logger('uncaughtException').error(err, origin)
  process.exit(127)
})

init()
