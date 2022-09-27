# YakumoRan V2
这里是YakumoRan 2.0版本，目前正在进行正式版发布前的测试

[![CodeFactor](https://www.codefactor.io/repository/github/iirose-tools/yakumoran/badge)](https://www.codefactor.io/repository/github/iirose-tools/yakumoran)


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

## 快速开始
- 运行 `npm install @yakumoran/core -g` 安装cli工具
- 运行 `yakumoran-cli init` 初始化配置
- 修改 config.json ，在plugins配置项中加载插件
- 配置完成后运行 `yakumoran-cli run` 启动机器人

config.json大致如下
```json
{
  "bot": {
    "master_name": "",
    "master_uid": "",
    "color": "",
    "username": "",
    "password": "",
    "room": "",
    "room_password": "",
    "port": 8800
  },
  "plugins": {
    "插件名1": {"插件配置1": "xxx"},
    "插件名2": {"插件配置2": "xxx"},
  },
  "database": {
    "client": "better-sqlite3",
    "connection": {
      "filename": "./data/database.db"
    }
  }
}
```

## 插件开发
- [开发文档](/docs)
