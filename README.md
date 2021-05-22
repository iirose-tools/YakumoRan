# YkumoRan

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fiirose-tools%2FYakumoRan.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fiirose-tools%2FYakumoRan?ref=badge_shield)
[![CodeFactor](https://www.codefactor.io/repository/github/iirose-tools/yakumoran/badge)](https://www.codefactor.io/repository/github/iirose-tools/yakumoran)

## 写在开头

- 不推荐使用聊天功能，词库有点怪
- 可以使用由春风开发的关键词回复功能
- [开发文档](./docs/api.md)

## 食用方法
### 权限组插件使用方法（请务必去查看一下）
[点我](./docs/Permission.md)

### 词库插件使用指北
[点我](https://blog.bstluo.top/index.php/2021/04/26/%e8%8a%b1%e5%9b%ad%e6%96%b0%e7%89%88%e8%af%8d%e5%ba%93%e5%bc%95%e6%93%8e%e4%bd%bf%e7%94%a8%e6%8c%87%e5%8c%97/)
### 使用二进制包

- 前往[GitHub Actions](https://github.com/iirose-tools/YakumoRan/actions/workflows/build.yml)下载对应系统的二进制包
- 直接运行
- 第一次运行会在根目录生成一个`config.json`文件并闪退，这是正常现象
- 这个时候就手动去修改`config.json`文件，修改完成后再次启动即可

### 手动部署

- 安装Nodejs
- 运行 `npm run build`
- 运行 `npm start` 启动项目
- 根据提示修改 `config.json` 文件
- 再次运行 `npm start` 启动项目
- 第一次运行时不要用pm2或类似工具启动项目，第一次启动时会有一个功能会询问你是否启用

## 关于心理监测

1. 本功能会记录最近10条聊天消息，便于志愿者们了解事情的经过
2. 日志有做脱敏，不会包含聊天信息
3. 本功能经过了花园站长Ruby的同意
4. 强烈建议开启这个功能，也许真的能救上几个人
5. 最后感谢瓜瓜提供的检测方案

## 配置文件

```javascript
{
  version: '配置文件版本号',
  // APP配置
  app: {
    nickname: '机器人昵称',
    master: '主人用户名',
    master_uid: '主人uid',
    color: '消息颜色'
  },
  // 功能配置
  function: {
    // 聊天功能
    chat: {
      disable: '是否关闭聊天功能，true或者false'
    },
    // 搜图功能
    pixiv: {
        disable: true
    },
    // SCP-079 辅助管理
    scp079: {
      nsfw_rate: '涩图检测阈值，默认0.8',
      allowGambling: '是否允许赌博，默认true',
      // 发言频率限制
      rate_limit: {
        duration: `刷屏检测周期`,
        limit: `限制消息条数`,
        action: {
          type: '执行操作，warn或者mute',
          warn: {
            message: '警告消息内容'
          },
          mute: {
            duration: `禁言时长`
          }
        }
      }
    },
    // 模拟赌博
    probab: {
      every: '赌博间隔(单位是毫秒)',
      huifu: '钱包恢复时间(单位是毫秒)'
    }
  },
  account: {
    username: '机器人用户名',
    password: '机器人密码md5',
    room: '房间id'
  },
  logger: {
    level: 'INFO'
  }
}
```

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fiirose-tools%2FYakumoRan.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fiirose-tools%2FYakumoRan?ref=badge_large)
