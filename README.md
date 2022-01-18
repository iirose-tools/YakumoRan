# YkumoRan

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fiirose-tools%2FYakumoRan.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fiirose-tools%2FYakumoRan?ref=badge_shield)
[![CodeFactor](https://www.codefactor.io/repository/github/iirose-tools/yakumoran/badge)](https://www.codefactor.io/repository/github/iirose-tools/yakumoran)

## 写在开头

- 可以使用由春风开发的关键词回复功能
- [开发文档](./docs/api.md)

## 食用方法
### 权限组插件使用方法（请务必去查看一下）
[点我](./docs/Permission.md)

### 词库插件使用指北
[点我](https://blog.bstluo.top/index.php/2021/04/26/%e8%8a%b1%e5%9b%ad%e6%96%b0%e7%89%88%e8%af%8d%e5%ba%93%e5%bc%95%e6%93%8e%e4%bd%bf%e7%94%a8%e6%8c%87%e5%8c%97/)

### 手动部署

- 安装Nodejs
- 运行 `npm run build`
- 运行 `npm start` 启动项目
- 根据提示修改 `config.json` 文件
- 再次运行 `npm start` 启动项目

## 配置文件

```javascript
{
  // 版本号，请勿修改
  "version": "1.0.2",
  // 应用配置
  "app": {
    "nickname": "昵称",
    "master": "主人用户名",
    "master_uid": "主人uid",
    "color": "消息颜色"
  },
  "function": {
    // Pixiv搜图
    "pixiv": {
      // 是否启用
      "disable": false
    },
    // 聊天功能
    "chat": {
      "disable": false,
      // 填写 Old 或 Rin
      "api": "Old"
    },
    "scp079": {
      // 涩图识别阈值
      "nsfw_rate": 0.85,
      // 是否允许赌博
      "allowGambling": true,
      // 发言频率限制
      "rate_limit": {
        // 时长（秒）
        "length": 60,
        // 消息条数
        "limit": 45,
        // 执行的动作
        "action": {
          // 填写warn(私聊发送消息警告)或mute(直接禁言)
          "type": "warn",
          "warn": {
            // 消息内容
            "message": "请不要刷屏哦~"
          },
          "mute": {
            // 禁言时长，单位秒
            "duration": 60
          }
        }
      }
    }
  },
  // 账号信息
  "account": {
    "username": "用户名",
    "password": "密码MD5",
    "room": "房间id"
  },
  // 日志
  "logger": {
    "level": "INFO"
  }
}
```

## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fiirose-tools%2FYakumoRan.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fiirose-tools%2FYakumoRan?ref=badge_large)
