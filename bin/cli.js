#! /usr/bin/env node
const { promises: fs } = require('fs')
const { join } = require('path')
const { exec } = require('child_process')
const crypto = require('crypto')
const inquirer = require('inquirer')

const question = async (query) => {
  const { answer } = await inquirer.prompt([
    {
      type: 'input',
      name: 'answer',
      message: query
    }
  ])

  return answer
}

const md5 = (str) => crypto.createHash('md5').update(str).digest('hex')

const init = async () => {
  const username = await question('机器人用户名: ')
  const password = md5(await question('机器人密码: '))
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

  try {
    await fs.mkdir(join(process.cwd(), 'data'))
  } catch (error) { }

  console.log('配置文件创建完成，默认使用better-sqlite3数据库，如需使用其他数据库请手动修改配置文件')
  fs.copyFile(join(__dirname, 'init.js'), join(process.cwd(), 'index.js'))

  const install = await question('要安装依赖吗? (y/n): ')
  if (install === 'y') {
    console.log('正在安装依赖...')
    const p = exec('npm install better-sqlite3 @yakumoran/core', { cwd: process.cwd() })
    p.on('exit', () => console.log('安装完成'))
  } else {
    console.log('配置完成，您可能需要手动安装依赖')
  }

  console.log('输入 yakumoran-cli run 运行机器人')
}

const run = async () => {
  require(`${process.cwd()}/index.js`)
}

const main = async () => {
  const subcommand = process.argv[2]

  if (subcommand === 'init') return init()
  if (subcommand === 'run') return run()

  console.log([
    'Usage: yakumoran-cli <command>',
    '',
    'Commands:',
    '  init  初始化新的机器人',
    '  run   运行机器人'
  ].join('\n'))
}

main()
