# YkumoRan

## 写在开头
- 不推荐使用聊天功能，词库有点怪
- 可以使用由春风开发的关键词回复功能

## 食用方法
- 安装Nodejs
- 参考 [配置文件](#配置文件) 修改config.ts配置文件
- 运行 `npm run build`
- 运行 `npm start` 启动项目

### 配置文件
```typescript
export default {
  app: {
    nickname: "机器人昵称",
    master: "主人用户名",
    master_uid: '主人uid',
    color: "消息颜色"    //不用#哦...示例：66ccff
  },
  chat: {
    disable: false      // true为关闭聊天功能，false为开启聊天功能
  },
  account: {
    username: "机器人用户名",
    password: "机器人密码md5",
    room: "房间id"
  },
  logger: {
    level: "INFO"
  }
}
