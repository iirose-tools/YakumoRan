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
- [ ] 插件加载器
- [ ] 网页控制面板
- [ ] 插件基类
- [ ] 机器人核心
- [x] ~~网络模块~~
- [x] ~~数据包编解码器~~
- [x] ~~配置文件解析器~~
- [ ] 配置文件热更新(用于SelfMove事件)
- [x] ~~日志模块~~

## 插件开发
Comming soon...
