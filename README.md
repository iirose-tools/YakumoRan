# YakumoRan
> 一个普通的花园机器人

## 食用方法
- 参考 [配置文件](#配置文件) 修改config.ts配置文件
- 运行 `npm run build`
- 运行 `npm start` 启动项目

### 配置文件
```typescript
export default {
  app: {
    nickname: "机器人昵称",
    master: "主人用户名",
    color: "消息颜色"
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
```

## 原版的聊天功能
- 春风不推荐使用...请在配置文件时修改是否启动聊天功能
- 春风编写的插件可以代替它聊天(虽然并不是每个问题都能回答....
