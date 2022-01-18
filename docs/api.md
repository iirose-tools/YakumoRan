# API文档
## 使用方法
```typescript
import * as Ran from '../../lib/api'
import log from '../../lib/logger'

// 日志实例
const logger = log("xxx")
```

## 事件
```typescript
// 被点赞
Ran.Event.on(event: 'like', listener: (msg: Like) => void): void;
// 登录成功
Ran.Event.on(event: 'login', listener: () => void): void;
// 播放媒体
Ran.Event.on(event: 'music', listener: (msg: Music) => void): void;
// 弹幕消息
Ran.Event.on(event: 'damaku', listener: (msg: Damaku) => void): void;
// 服务器推送的在线用户列表
Ran.Event.on(event: 'UserList', listener: (msg: UserList[]) => void): void;
// 用户加入房间
Ran.Event.on(event: 'JoinRoom', listener: (msg: SystemMessage) => void): void;
// 用户离开房间
Ran.Event.on(event: 'LeaveRoom', listener: (msg: SystemMessage) => void): void;
// 切换房间
Ran.Event.on(event: 'SwitchRoom', listener: (msg: SwitchRoom) => void): void;
// 银行消息Callback(建议调用 Ran.method.system.bank 函数获取返回值，不要使用次事件)
Ran.Event.on(event: 'BankCallback', listener: (msg: BankCallback) => void): void;
// 群聊消息
Ran.Event.on(event: 'PublicMessage', listener: (msg: PublicMessage) => void): void;
// 私聊消息
Ran.Event.on(event: 'PrivateMessage', listener: (msg: PrivateMessage) => void): void;
// 支付Callback
Ran.Event.on(event: 'paymentCallback', listener: (msg: paymentCallback) => void): void;
// 获取用户列表Callback (建议调用 Ran.method.utils.getMediaList 函数获取返回值，不要使用次事件)
Ran.Event.on(event: 'GetUserListCallback', listener: (msg: GetUserListCallback[]) => void): void;
// 用户资料卡Callback (建议调用 Ran.method.utils.getUserProfile 函数获取返回值，不要使用次事件)
Ran.Event.on(event: 'UserProfileCallback', listener: (msg: UserProfileCallback) => void): void;
// 媒体列表Callback (建议调用 Ran.method.utils.getMediaList 函数获取返回值，不要使用次事件)
Ran.Event.on(event: 'MediaListCallback', listener: (msg: MediaListCallback[]) => void): void;
// 转账信息
Ran.Event.on(event: 'payment', listener: (msg: Payment) => void): void;
// 房间公告
Ran.Event.on(event: 'roomNotice', listener: (msg: RoomNotice) => void): void;
// 被关注
Ran.Event.on(event: 'follower', listener: (msg: Follower) => void): void;
```

## 方法
```typescript
Ran.method.admin.blackList('username', '10s', 'xxx') // 把 username 加入黑名单，时间 10 秒，备注为 xxx
Ran.method.admin.kick('username') // 踢出用户名为 username 的人
Ran.method.admin.media.clear() // 清空媒体
Ran.method.admin.media.cut('xxx') // 切除 id 为 xxx 的媒体
Ran.method.admin.media.cut() // 切除正在播放的媒体
Ran.method.admin.media.exchange('id1', 'id2') // 交换媒体 id1 和 id2
Ran.method.admin.media.goto('10s') // 把正在播放的媒体跳转到 10s 处
Ran.method.admin.media.op('>', '10s') // 媒体快进 10 秒
Ran.method.admin.media.op('<', '10s') // 媒体快退 10 秒
Ran.method.admin.mute('chat', 'username', '10s', 'xxx') // 把 username 禁止发言 10 秒，备注 xxx
Ran.method.admin.mute('music', 'username', '10s', 'xxx') // 把 username 禁止点歌 10 秒，备注 xxx
Ran.method.admin.mute('all', 'username', '10s', 'xxx') // 把 username 禁止点歌和发言 10 秒，备注 xxx
Ran.method.admin.notice('xxx') // 发送房间公告，内容为 xxx
Ran.method.admin.setMaxUser() // 清除房间人数上限
Ran.method.admin.setMaxUser(10) // 设置房间人数上线为 10
Ran.method.admin.whiteList('username', '10s', 'xxx') // 把 username 加入白名单 10 秒，备注 xxx
Ran.method.bot.moveTo('roomid') // 把机器人移动到房间id为 roomid 的房间
Ran.method.like('qwq', 'xxx') // 给 uid 为 qwq 的用户点个赞，备注 xxx
Ran.method.payment('qwq', 10, 'xxx') // 给 uid 为 qwq 的用户转账 10 钞，备注 xxx
Ran.method.sendDamaku('xxx', '66ccff') // 发送弹幕，内容为 xxx ，颜色为 #66ccff
Ran.method.sendMedia('music', '标题', '歌手', '封面图', '链接', '歌曲链接', 120, 320, '66ccff') // 发送歌曲，比特率 320kbps ，时长 120 秒，卡片颜色66ccff
Ran.method.sendMedia('video', '标题', '歌手', '封面图', '链接', '歌曲链接', 120, 320, '66ccff') // 发送视频，比特率 320kbps ，时长 120 秒，卡片颜色66ccff
Ran.method.sendPrivateMessage('qwq', 'xxx', '66ccff') // 给 uid 为 qwq 的用户发送一条内容为 xxx 的私聊消息，气泡颜色为 #66ccff
Ran.method.sendPublicMessage('xxx', '66ccff') // 发送一条消息内容为 xxx 的群聊消息，颜色为 #66ccff
Ran.method.system.bank() // 获取银行数据
Ran.method.utils.getMediaList() // 获取媒体列表
Ran.method.utils.getUserList() // 获取用户列表
Ran.method.utils.getUserProfile('username') // 获取用户名为 username 的人的资料卡信息
```

## 其他
### 获取数据目录
```typescript
const path = Ran.Data
```

### 注册命令

id建议写成 `functionID.commandId` 这样的格式

```typescript
Ran.command(/正则表达式/, 'id', async (m, e, reply) => {
  // your code
})
```

### 使用插件管理器
```typescript
import { plugin } from '../manager'

plugin.on('id', isEnable => {
  if (isEnable) {
    // 启动插件
  } else {
    // 停止插件
  }
})
```
