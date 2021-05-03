# Permission|权限组插件使用指南
## 目录
- [Permission|权限组插件使用指南](#permission权限组插件使用指南)
  - [目录](#目录)
  - [一些基础概念](#一些基础概念)
  - [关于uid](#关于uid)
  - [指令](#指令)
    - [创建权限组](#创建权限组)
    - [查看权限组信息](#查看权限组信息)
    - [给权限组添加权限](#给权限组添加权限)
    - [查看权限组是否拥有某个权限](#查看权限组是否拥有某个权限)
    - [创建用户](#创建用户)
    - [查看用户信息](#查看用户信息)
    - [给用户添加权限](#给用户添加权限)
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
- 这个时候获取到的uid格式是` [@5e5f74214192a@] `这样的
- 只需要保留中间的`5e5f74214192a`即可

## 指令
### 创建权限组
> .p group create 权限组名称
- 权限节点：permission.group.create

### 查看权限组信息
> .p group info 权限组名称
- 权限节点：permission.group.info

### 给权限组添加权限
> .p group add 权限组 权限节点
- 权限节点：permission.group.add

### 查看权限组是否拥有某个权限
> .p group has 权限组 权限节点
- 权限节点：permission.group.has

### 创建用户
> .p user create uid
- 权限节点：permission.user.create

### 查看用户信息
> .p user info uid
- 权限节点：permission.user.info

### 给用户添加权限
> .p user add uid 权限节点
- 权限节点：permission.user.add

### 查看用户是否拥有某个权限
> .p user has uid 权限节点
- 权限节点：permission.user.has

### 把用户加入到权限组
> .p user join uid 权限组
- 权限节点：permission.user.join

### 查看自己是否拥有某个权限
> .p me has 权限节点
- 权限节点：无