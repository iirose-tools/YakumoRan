import got from 'got'
import logger from './lib/logger'
import pack from './package.json'
import readline from 'readline'
import fs from 'fs'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

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

const question = () => {
  return new Promise((resolve, reject) => {
    rl.question([
      '请问您是否同意开发团队分析聊天消息用于发现心理疾病患者并进行人工干预',
      '注：本Bot不会保留任何聊天记录，仅做实时分析',
      '具体的可以看这个链接：https://github.com/iirose-tools/YakumoRan#关于心理监测',
      '同意请输入Y，拒绝请输入n（Y/n）:'
    ].join('\n'), result => {
      const isAllow = result.toLowerCase() === 'y'
      if (isAllow) fs.writeFileSync('./mentality.allow', 'true')
      resolve(isAllow)
    })
  })
}

const init = async () => {
  logger('Core').info('正在启动...')

  if (!fs.existsSync('./mentality.allow')) await question()

  update()
  await import('./lib/core')
  await import('./lib/function')
}

process.on('uncaughtException', (err: any, origin: any) => {
  logger('uncaughtException').error(err, origin)
  process.exit(127)
})

init()
