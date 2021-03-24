# YakumoRan
> 一个普通的花园机器人

## 食用方法
- 新建 config.ts 文件
- 参考 [配置文件](#配置文件) 修改配置文件
- 运行 `npm run build`
- 运行 `npm start` 启动项目

### 配置文件
```typescript
export default {
  app: {
    nickname: "机器人昵称",
    master: "主人用户名",
    master_uid: '主人uid',
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

## 未来的一些计划
- [ ] 支持资料卡等协议
- [ ] 支持炒股协议
- [ ] 增加QQ/花园联动功能(消息转发)