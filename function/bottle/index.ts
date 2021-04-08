// import request from 'request'
import * as api from '../../lib/api'
import config from '../../config'
// import http from 'http'
// import fs from 'fs'
// import path from 'path'
// import logger from '../../lib/logger'
// localhost:11451/addBottle
const fetch = require('node-fetch')
async function getRandomBottle () {
  const response = await fetch('http://bottle.bstluo.top:11451/getRandomBottle')
  const abody = await response.json()
  return abody
}
// getRandomBottle();

async function throwNewBottle (uid:string, content:string, name:string) {
  const arr = new URLSearchParams({ content: content, uid: uid, name: name })
  fetch('http://bottle.bstluo.top:11451/addBottle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    body: arr
  }).then((Response: any) => {
    return Response.status
  })
}
// throwNewBottle('512341','希望开心。','星星');

async function addReply(bid:string, content:string, name:string, uid:string) {
  const arr = new URLSearchParams({ content: content, uid: uid, name: name, bid: bid })
  fetch('http://bottle.bstluo.top:11451/addReply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    body: arr
  }).then((Response:any) => {
    if (Response.status === 454) {
      console.log('提交失败!')
      return false
    } else {
      console.log('大概是提交成功了~。')
      return true
    }
  })
}
// addReply('FkrJ4R5ryg',"希望你也顺利。","BSO",'114514');

async function getMyBottle(uid:string) {
  const res = await fetch(`http://bottle.bstluo.top:11451/checkMyBottle/${uid}`)
  const result = await res.json()
  if (res.status === 200) {
    console.log('读取用户记录成功。')
    console.log(result)
  } else {
    console.log('读取失败')
  }
}
// getMyBottle(114514);

async function getCertainBottle(bid:string) {
  const res = await fetch(`http://bottle.bstluo.top:11451/checkBottle/${bid}`)
  if (res.status === 200) {
    console.log(`执行查看指定${bid}瓶子的请求成功。`)
    const result = await res.json()
    console.log(result)
  } else {
    console.log('查询失败!')
  }
}
// 注意数字形式的json和string形式的json，传入数字就是数字，数字的字符串就是字符串。
// getCertainBottle(`FkrJ4R5ryg`)
const createNewBottle = async (uid:string, content:string, name:string) => {
  let result = await throwNewBottle(uid, content, name);
}

// 创建瓶子指令
api.command(/^以(.*)之名，丢出漂流瓶,内容如下:(.*)$/, (m, e, reply) => {
  const id:string = e.uid
  const name:string = m[1]
  const content:string = m[2]
  const status = throwNewBottle(id, content, name)
  console.log(status)
  reply('丢出成功', config.app.color)
})

// 捡瓶子指令
api.command(/^捡瓶瓶。$/, (m, e, reply) => {
  new Promise (function(resolve, reject) {
    resolve(getRandomBottle())
  }).then(function(result:any) {
    reply(`你收到了${result.name}的漂流瓶，编号为${result.bid}内容如下:`, config.app.color)
    reply(`${result.content}`, config.app.color)
    if (result.reply[0]) {
      reply(`伴随着瓶子夹杂这样的纸条。${result.reply[0]}`, config.app.color)
    }
  }).finally(() => {
    console.log('执行捡瓶子完毕')
  }).catch(() => {
    console.log('是发生错误了吗干？')
  })
})
