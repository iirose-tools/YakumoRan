# YakumoRan
> 一个普通的花园机器人

## 食用方法
- 参考 [配置文件](#配置文件) 修改配置文件
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
    disable: false      // 关闭聊天功能
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

## 原版聊天功能春风不推荐使用...请尽可能在[食用方法]第二步之前前往function文件夹的chat文件夹删除掉
