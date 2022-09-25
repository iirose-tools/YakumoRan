# YakumoRan V2
这里是YakumoRan 2.0版本，目前还在开发中，不能用于生产环境

## 目录结构
```
|-- config.json # 配置文件
|-- src
|   |-- index.ts # 入口文件
|   |-- cli.ts # 命令行入口文件
|   |-- core
|   |   |-- loader # 插件加载器
|   |   |-- web # 网页控制面板
|   |   |-- plugin # 插件基类
|   |   |-- bot # 机器人基类
|   |   |-- network # 网络基类
|   |   |-- utils # 工具函数
|   |   |-- config # 配置解析器
|   |   |-- logger # 日志模块
|   |   |-- packet # 数据包编解码器
|   |   |   |-- index.ts # 入口文件
|   |   |   |-- encoder # 编码器
|   |   |   |-- decoder # 解码器
```

## 开发进度
- [x] ~~插件加载器~~
- [ ] 网页控制面板
- [x] ~~插件基类~~
- [x] ~~机器人核心~~
- [x] ~~网络模块~~
- [x] ~~数据包编解码器~~
- [x] ~~配置文件解析器~~
- [ ] 配置文件热更新(用于SelfMove事件)
- [x] ~~日志模块~~
- [ ] 数据库

## 插件开发
Comming soon...

暂且放个demo
```typescript
import { App } from "../src";
import { PublicMessage } from "../src/core/packet/decoder/PublicMessage";
import { Plugin } from "../src/core/plugin";

const config = {
  // 配置文件
}

const app = new App(config)

const MyPlugin = (app: App) => {
  class MyPlugin extends Plugin {
    async init () {
      // 这里的信息暂且还没用上，暂且先预留
      this.plugin_name = "Test Plugin"
      this.plugin_author = "风间苏苏"
      this.plugin_version = "2.0-beta"
      this.plugin_description = [
        "这是一个测试插件",
        "多行文本测试",
        '1111111111',
        '222222222'
      ].join('\n')
      this.logger.info('Test Plugin Loaded')
    }

    // 监听事件
    @app.decorators.EventListener('PublicMessage')
    public onMessage (msg: PublicMessage) {
      this.logger.info('Test Plugin Received Message: ', msg)
    }

    // 注册指令
    @app.decorators.Command({
      name: 'test',
      command: /^\/test$/,
      desc: '测试插件',
      usage: '/test'
    })
    public onTestCommand (msg: PublicMessage, args: RegExpExecArray) {
      this.logger.info('Test Plugin Received Command: ', msg)
      this.app.api.sendPublicMessage('Test Plugin Received Command: ' + msg.message)
      return false
    }
  }

  return MyPlugin
}

// 加载插件
app.loadPlugin('test-plugin', MyPlugin)
```