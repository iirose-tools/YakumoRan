# 快速开始
## 写在开头
- 虽然说直接用javascript开发也没问题，但是javascript没有办法获得完整的代码提示，为了良好的开发体验还是推荐直接用typescript开发

## 准备工作
安装机器人框架
```bash
$ npm install @yakumoran/core
```

准备配置文件和启动器
```typescript
import { App } from "@yakumoran/core";

const app = new App({
  // 配置文件
})

// 使用文件名加载插件，在这里插件名与文件名相同
app.loadPlugin('xxx')

// 直接传入插件实例，无论是传入文件名还是实例，都需要填写插件名
app.loadPlugin('xxx', MyPlugin)
```

## 开始开发
```typescript
import { App, Plugin } from "@yakumoran/core";

export default const MyPlugin = (app: App) => {
  // 需要注意的是class的名字也会作为插件的id在机器人内部使用，需要保证全局唯一
  class MyPlugin extends Plugin {
    async init() {
      // 在这里可以进行一些初始化操作，例如初始化数据库表结构等
    }

    @app.decorators.EventListener('PublicMessage')
    public onMessage (msg: PublicMessage) {
      // 使用修饰器来注册事件，注册其他事件也是同理
      // 同时也可以使用 this.app.on('PublicMessage', (msg) => {}) 来注册事件
    }

    // 以下内容在帮助信息中会显示为 "/test <anything> - 一个测试指令(/test <string>)"
    @app.decorators.Command({
      name: '/test <anything>',
      command: /^\/test (\S+)$/,
      desc: '一个测试指令',
      usage: '/test <string>',
      privateChat: false // 是否接受私聊消息(可选，默认为true)
      publicChat: true // 是否接受群聊消息(可选，默认为true)
    })
    public onTestCommand (msg: PublicMessage, args: RegExpExecArray) {
      const str = args[1]
      // 发送消息
      this.app.api.sendPublicMessage(`test => ${str}`)
    }
  }

  return MyPlugin
}
```

现在回到花园，试试发送 `/test hello` ，机器人会回复 `test => hello`