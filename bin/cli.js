#! /usr/bin/env node
const { App } = require('@yakumoran/core')
const { promises: fs, existsSync } = require('fs')
const { join } = require('path')
const { createCommand } = require('commander')
const { promises: readline } = require('readline')
const { exec } = require('child_process')

const question = async (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const answer = await rl.question(query)
  rl.close()
  return answer
}

const main = async () => {
  createCommand('init')
    .description('初始化一个新的机器人')
    .action(async () => {
      const username = await question('机器人用户名: ')
      const password = await question('机器人密码: ')
      const color = await question('消息气泡颜色(不含#): ')
      const masterUid = await question('主人UID: ')
      const masterName = await question('主人用户名: ')
      const port = await question('网页面板端口: ')
      const room = await question('房间ID: ')
      const roomPassword = await question('房间密码(无密码请留空): ')

      const config = {
        bot: {
          username,
          password,
          master_uid: masterUid,
          master_name: masterName,
          color,
          room,
          room_password: roomPassword,
          port
        },
        plugins: {},
        database: {
          client: 'better-sqlite3',
          connection: {
            filename: `${join(process.cwd(), 'data', 'database.sqlite')}`
          }
        }
      }

      await fs.writeFile(join(process.cwd(), 'config.json'), JSON.stringify(config, null, 2))

      console.log('配置文件创建完成，默认使用better-sqlite3数据库，如需使用其他数据库请手动修改配置文件')
      const install = await question('要安装依赖吗? (y/n): ')
      if (install === 'y') {
        const p = exec('npm install')
        p.stderr?.pipe(process.stderr)
        p.stdout?.pipe(process.stdout)

        p.on('exit', () => {
          const p = exec('npm install better-sqlite3')

          p.stderr?.pipe(process.stderr)
          p.stdout?.pipe(process.stdout)

          p.on('exit', () => console.log('安装完成'))
        })
      }
    })

  createCommand('run')
    .description('运行机器人')
    .action(async () => {
      const confPath = join(process.cwd(), 'config.json')

      if (!existsSync(confPath)) {
        console.log('配置文件不存在，请先运行init命令初始化配置文件')
        return
      }

      const config = JSON.parse(await fs.readFile(confPath, 'utf-8'))
      const app = new App(config)

      for (const plugin of Object.keys(config.plugins)) {
        app.loadPlugin(plugin)
      }
    })
}

main()
