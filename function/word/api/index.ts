import fs from 'fs'
import path from 'path'
import { analysis } from './analysis'
import { edit } from './edit'
import { query } from './query'

export default class word {
  where:any
  dir:any
  wordData:any
  userData:any
  nickname:string

  // 苏苏的随机数生成姬
  random = (n: number, m: number): number => { return Math.floor(Math.random() * (m - n + 1) + n) }

  /**
  * 返回一个文件的json对象
  * @param list 词库文件目录（wordconfig/userData/wordData）
  * @param name 词库文件名
  * @return 词库json对象
  */
  getjson = (list:string, name:string) => {
    const wordPath = path.join(this.dir, `./word/${list}/${name}.json`)
    if (!fs.existsSync(wordPath)) {
      fs.writeFileSync(wordPath, '{}')
    }

    return JSON.parse(fs.readFileSync(wordPath).toString())
  }

  /**
  * 将词库json对象存储在文件内
  * @param list 词库文件目录
  * @param name 词库文件名
  * @param file 词库json对象
  */
  update = (list:string, name:string, file:any) => {
    try {
      fs.writeFileSync(path.join(this.dir, `./word/${list}/${name}.json`), JSON.stringify(file, null, 3))
    } catch (error) {
    }
  }

  /**
  * 将词库json对象存储在文件内
  * @param list 词库文件目录
  * @param name 词库文件名
  * @param file 词库json对象
  */
  incrementalUpdat = (list:string, name:string, file:any) => {
    try {
      const wordData = this.getjson(list, name)
      const fileKeys = Object.keys(file)
      for (let item = 0; item < fileKeys.length; item++) {
        if (!wordData[fileKeys[item]]) { wordData[fileKeys[item]] = [] }
        wordData[fileKeys[item]] = wordData[fileKeys[item]].concat(file[fileKeys[item]])
      }

      fs.writeFileSync(path.join(this.dir, `./word/${list}/${name}.json`), JSON.stringify(wordData, null, 3))
    } catch (error) {
    }
  }

  /**
    * 初始化词库对象
    * @dir 指定词库存储根目录
    * @uid 机器人主人
    * @nick 机器人昵称
  */
  constructor (dir:string, uid:string, nick:string) {
    this.dir = dir
    try { fs.mkdirSync(path.join(dir, 'word')) } catch (err) { }
    try { fs.mkdirSync(path.join(dir, 'word/wordData')) } catch (err) { }
    try { fs.mkdirSync(path.join(dir, 'word/userData')) } catch (err) { }
    try { fs.mkdirSync(path.join(dir, 'word/wordconfig')) } catch (err) { }
    const adminlist = this.getjson('wordconfig', 'adminlist')
    if (!adminlist.admin) { // admin高级权限
      adminlist.admin = [uid]
    }
    this.update('wordconfig', 'adminlist', adminlist)
    this.nickname = nick
  }

  /**
    * 添加词库
    * @param q 指定触发词
    * @param a 指定触发后的回复
    * @param m 指定编辑者数据json：{uid:"id",name:"昵称"}
    * @return 返回为字符串，成功/失败
  */
  add = (q:string, a:string, m:any) => { return edit.add(q, a, m, this.dir) }

  /**
       * 删除词库
       * @param q 指定触发词
       * @param num 指定第几条回复（若为'all'则删除整个词条）
       * @param m 指定编辑者数据json：{uid:"id",name:"昵称"}
       * @return 返回为字符串，成功/失败
  */
  del = (q:string, num:string, m:any) => { return edit.del(q, num, m, this.dir) }

  /**
    * 获取触发词的位置
    * @param q 被寻找的触发词
    * @return 返回为搜索结果（字符串）
  */
  getas = (q:string) => { return query.getas(q, this.dir) }

  /**
    * 获取回复词的位置
    * @param a 被寻找的回复词
    * @return 返回为搜索结果（字符串）
  */
  getqs = (a:string) => { return query.getqs(a, this.dir) }

  /**
    * 获取问的表
    * @param q 显示的库
    * @param m 查询者数据json：{uid:"id",name:"昵称"}
    * @return 返回为搜索结果（字符串）
  */
  alist = (q:string, m:any) => { return query.alist(q, m, this.dir) }

  /**
    * 选择编辑词库
    * @param db 设置被编辑词库
    * @param m 设置人数据json：{uid:"id",name:"昵称"}
    * @return 返回为回复结果（成功/失败）
  */
  in = (db:string, m:any) => { return edit.in(db, m, this.dir) }

  /**
      * 恢复编辑默认词库
      * @param m 设置人数据json：{uid:"id",name:"昵称"}
      * @return 返回为回复结果（成功/失败）
    */
  out = (m:any) => { return edit.out(m, this.dir) }

  /**
    * 获取库的表
    * @return 返回为搜索结果（字符串）
  */
  list = () => { return query.list(this.dir) }

  /**
        * 获取库内的问表
        * @name 库名（字符串）
        * @return 返回为搜索结果（字符串）
      */
  qlist = (name:string) => { return query.qlist(name, this.dir) }

  /**
    * 增加词库管理员
    * @name 唯一标识（字符串）
    * @return 返回为结果（字符串）
  */
  op = (name:string) => { return edit.op(name, this.dir) }

  /**
    * 去除词库管理员
    * @name 唯一标识（字符串）
    * @return 返回为结果（字符串）
  */
  deop = (name:string) => { return edit.deop(name, this.dir) }

  /**
    * 删除某一词库
    * @param name 需要删除的词库
    * @return 返回结果
  */
  over = (name:string) => {
    return edit.over(name, this.dir)
  }

  /**
    * 查询排行榜
    * @itemName 查询的物品（字符串），切记只能查询物品，不能查询文字
    * @return 返回为结果（字符串）
  */
  leaderboard = (itemName:string) => { return query.leaderboard(itemName, this.dir) }

  /**
    * 词库解析
    * @param rawq 需要回复的触发词
    * @param m 触发者的数据json:{uid:'id',name:'昵称'}
    * @return 返回为回复结果
  */
  start = (rawq:string, m:any) => { return analysis.start(rawq, m, this.dir, this.nickname) }

  /**
    * 查询相关的库
    * @return 返回为搜索结果（字符串）
  */
  findList = (name:string) => { return query.findList(name, this.dir) }

  /**
    * 直接解析
    * @param wd 需要回复的触发词
    * @param uid 当前用户id
    * @param userName 当前名字
    * @return 返回为回复结果
  */
  toPars = (wd:string, uid:string, userName:string) => { return analysis.toPars(wd, this.dir, uid, userName) }
}
