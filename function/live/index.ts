import * as api from '../../lib/api'
import per from '../permission/permission'
import md5 from 'md5'

const data: any = {}
const listNai: any = []

const nai = (e: any, reply: any) => {
  reply(` [BST Live]  :  [*${e.username}*] 您未拥有直播权限\n\n您的权限申请已发送给管理员`)
  listNai.push(e.uid)
  api.method.sendPrivateMessage('5b0fe8a3b1ff2', `[BST Live]申请者：\n\n${e.uid}`)
  api.method.sendPrivateMessage('5b17af7a285d7', `[BST Live]申请者：\n\n${e.uid}`)
}

api.command(/^live start$/, 'live.start', (m, e, reply) => {
  // 鉴权
  if (!per.users.hasPermission(e.uid, 'live.op') && !per.users.hasPermission(e.uid, 'permission.live.op')) return nai(e, reply)

  // 声明变量
  const livePassword: string = 'BSTlive'
  const webNet: string = 'nms.bstluo.top'
  const timeIma: number = new Date().getTime()
  const timeMirai: number = new Date().getTime() + 86400
  const bstLiveWeb: string = 'http://player.bstluo.top/index.html?'
  let liveNetIirose: string = ''
  let liveNetObs: string = ''
  let liveNetWeb: string = ''
  let liveNetPassworld: string = ''
  let obsPassword: string = ''
  data[e.uid] = { a: '', b: '', c: '', d: '' }

  // 主程序
  obsPassword = md5(`/live/${timeIma}${livePassword}-${timeMirai}-${livePassword}`)
  liveNetIirose = `https://${webNet}/live/${timeIma}${livePassword}.flv?sign=${timeMirai}-${obsPassword}`
  liveNetObs = `rtmp://${webNet}:1015/live`
  liveNetPassworld = `${timeIma}${livePassword}?sign=${timeMirai}-${obsPassword}`
  liveNetWeb = `${bstLiveWeb}${liveNetIirose}`
  data[e.uid].a = liveNetObs
  data[e.uid].b = liveNetPassworld
  data[e.uid].c = liveNetWeb
  data[e.uid].d = liveNetIirose

  // iirose输出
  api.method.sendPrivateMessage(e.uid, `[BST Live]\n\n您的推流地址为：\n\n${liveNetObs}\n\n您的推流密钥为：\n\n${liveNetPassworld}\n\n您的直播间网址为；\n\n${liveNetWeb}\n(此链接为您直播观看网址)\n\n下面是您的直播链接\n(长按解析复制直播链接，在房间@+链接就可打开直播)\n(推流码有效期为24h，过期请重新申请)`)
  api.method.sendPrivateMessage(e.uid, liveNetIirose)
})

// 授权
api.command(/^live can (.*)$/, 'live.can', (m, e, reply) => {
  per.users.addPermission(m[1], 'live.op')
  api.method.sendPrivateMessage(m[1], '[BST live]\n您的申请已通过，再次发送 live start 获取推流码')
  api.method.sendPrivateMessage('5b17af7a285d7', `[BST Live]申请者：${m[1]}申请已通过`)
  api.method.sendPrivateMessage('5b0fe8a3b1ff2', `[BST Live]申请者：${m[1]}申请已通过`)
  if (listNai.indexOf(m[1]) > -1) {
    listNai.splice(listNai.indexOf(m[1]), 1)
  }
})

// 查看未授权列表
api.command(/^live list$/, 'live.list', (m, e, reply) => {
  let msg = '[BST Live]申请表\n'
  listNai.forEach(function (d: any) {
    msg = msg + ` [@${d}@]  >>  ${d}\n`
  })
  reply(msg)
})

// 查看自己的资料
api.command(/^live data$/, 'live.data', (m, e, reply) => {
  if (data[e.uid]) {
    reply(`用户:${e.username}\n\n推流地址：\n\n${data[e.uid].a}\n\n推流密钥：${data[e.uid].b}\n\n直播链接如下\n(长按解析复制直播链接，在房间@+链接就可打开直播)`)
    reply(data[e.uid].c)
  } else {
    reply('列表为空')
  }
})

// 主动申请权限
api.command(/^live apply$/, 'live.apply', (m, e, reply) => {
  nai(e, reply)
})
