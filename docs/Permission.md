# Permission|权限组插件使用指南
## 目录
- [Permission|权限组插件使用指南](#permission权限组插件使用指南)
  - [目录](#目录)
  - [一些基础概念](#一些基础概念)
  - [关于uid](#关于uid)
  - [权限组和uid自动过滤内容](#权限组和uid自动过滤内容)
  - [指令](#指令)
    - [创建权限组](#创建权限组)
    - [删除权限组](#删除权限组)
    - [查看权限组列表](#查看权限组列表)
    - [查看权限组信息](#查看权限组信息)
    - [给权限组添加权限](#给权限组添加权限)
    - [给权限组删除权限](#给权限组删除权限)
    - [查看权限组是否拥有某个权限](#查看权限组是否拥有某个权限)
    - [创建用户](#创建用户)
    - [删除用户](#删除用户)
    - [查看用户列表](#查看用户列表)
    - [查看拥有指定权限的用户](#查看拥有指定权限的用户)
    - [查看用户信息](#查看用户信息)
    - [给用户添加权限](#给用户添加权限)
    - [给用户删除权限](#给用户删除权限)
    - [查看用户是否拥有某个权限](#查看用户是否拥有某个权限)
    - [把用户加入到权限组](#把用户加入到权限组)
    - [查看自己是否拥有某个权限](#查看自己是否拥有某个权限)

## 一些基础概念
- 用户可以单独拥有权限，也会继承权限组的权限
- 一个用户可以同时属于多个权限组
- 权限有上下级之分，`a.b.c`是`a.b`的下级，拥有`a.*`的 用户/权限组 可以获得所有`a.`开头的权限和`a`权限本身
- 机器人主人默认拥有`permission.*`权限，可以使用权限组插件的所有指令

## 关于uid
- uid就是花园的`唯一标识`
- 可以在资料卡点击用户头像获得

## 权限组和uid自动过滤内容
以下内容会被自动过滤掉
- `所有空白字符`
- `.`
- `[`
- `]`
- `@`
- `\`
- `/`

## 指令
### 创建权限组
> .p group create 权限组名称
- 权限节点：permission.group.create

### 删除权限组
> .p group del 权限组名称
- 权限节点：permission.group.delete

### 查看权限组列表
> .p group list
- 权限节点 permission.group.list

### 查看权限组信息
> .p group info 权限组名称
- 权限节点：permission.group.info

### 给权限组添加权限
> .p group add 权限组 权限节点
- 权限节点：permission.group.add

### 给权限组删除权限
> .p group rm 权限组 权限节点
- 权限节点：permission.group.remove

### 查看权限组是否拥有某个权限
> .p group has 权限组 权限节点
- 权限节点：permission.group.has

### 创建用户
> .p user create uid
- 权限节点：permission.user.create
- 
### 删除用户
> .p user del uid
- 权限节点：permission.user.delete

### 查看用户列表
> .p user list
- 权限节点：permission.user.list

### 查看拥有指定权限的用户
> .p user list 权限节点
- 权限节点：permission.user.plist

### 查看用户信息
> .p user info uid
- 权限节点：permission.user.info

### 给用户添加权限
> .p user add uid 权限节点
- 权限节点：permission.user.add

### 给用户删除权限
> .p user rm uid 权限节点
- 权限节点：permission.user.remove

### 查看用户是否拥有某个权限
> .p user has uid 权限节点
- 权限节点：permission.user.has

### 把用户加入到权限组
> .p user join uid 权限组
- 权限节点：permission.user.join

### 查看自己是否拥有某个权限
> .p me has 权限节点
- 权限节点：无