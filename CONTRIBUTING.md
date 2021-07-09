# Contributing
## 基本规范
### Git相关
- 禁止直接向 main 分支提交代码，所有代码均提交至 dev 分支，发布新版本时合并进 main 分支
- 若无特殊情况，禁止 force push

### 代码
- 最基本的 eslint 检测要过
- 不要把单个的 function/method 写的太复杂，尽量拆分一下下
- 变量/函数命名长一点无所谓，别用拼音和不明所以的单词

### 插件开发规范
- 请在 package.json 文件中写明插件的基本信息
- package.json 的命令列表也请尽量写的完善一点
- 命令不要太过复杂

### 文档相关
- 文档统一放在 ./docs 目录下
- 文档统一使用 Markdown 格式书写
- 排版尽量遵守 [中文文案排版指北](https://github.com/sparanoid/chinese-copywriting-guidelines/blob/master/README.zh-CN.md)
