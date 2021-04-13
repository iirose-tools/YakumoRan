# YkumoRan
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fiirose-tools%2FYakumoRan.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fiirose-tools%2FYakumoRan?ref=badge_shield)


## 写在开头
- 不推荐使用聊天功能，词库有点怪
- 可以使用由春风开发的关键词回复功能

## 食用方法
- 安装Nodejs
- 运行 `npm run build`
- 运行 `npm start` 启动项目
- 根据提示修改 `config.json` 文件
- 再次运行 `npm start` 启动项目

## 配置文件
- `version`: 版本号，对应package.json中的version
- `app`: APP配置
- - `nickname`: 机器人昵称
- - `master`: 主人用户名
- - `master_uid`: 主人uid
- - `color`: 气泡颜色
- `function`: 插件配置
- - `chat`: 聊天功能
- - - `disable`: 是否关闭聊天功能
- - `scp079`: SCP-79
- - - `nsfw_rate`: 涩图检测阈值，默认0.8
- - - `allowGambling`: 是否允许赌博，默认 `true`
- - `probab`: 模拟赌博功能
- - - `every`: 赌博间隔(单位是毫秒)
- - - `huifu`: 钱包恢复时间(单位是毫秒)
- `account`: 账号配置
- - `username`: 用户名
- - `password`: 密码MD5
- - `room`: 房间id
- `logger`: 日志配置
- - `level`: 日志级别，默认INFO

## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fiirose-tools%2FYakumoRan.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fiirose-tools%2FYakumoRan?ref=badge_large)