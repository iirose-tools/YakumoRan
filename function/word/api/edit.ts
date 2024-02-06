import fs from 'fs'
import path from 'path'

/**
    * 返回一个文件的json对象
    * @param list 词库文件目录（wordconfig/userData/wordData）
    * @param name 词库文件名
    * @return 词库json对象
  */
const getjson = (list:string, name:string, dir:any) => {
  const wordPath = path.join(dir, `./word/${list}/${name}.json`)
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
const update = (list:string, name:string, file:any, dir:any) => {
  try {
    fs.writeFileSync(path.join(dir, `./word/${list}/${name}.json`), JSON.stringify(file, null, 3))
  } catch (error) {
  }
}

export const edit = {
  /**
    * 添加词库
    * @param q 指定触发词
    * @param a 指定触发后的回复
    * @param m 指定编辑者数据json：{uid:"id",name:"昵称"}
    * @return 返回为字符串，成功/失败
  */
  add (q:string, a:string, m:any, dir:any) {
    // 获取json对象后判断key是否存在，不存在则定义为数组，若存在则为数组添加元素，并存储它
    const uid = m.uid
    let listName = ''
    const list = getjson('wordconfig', 'userlist', dir)
    if (Object.prototype.hasOwnProperty.call(list, uid)) {
      listName = list[uid]
    } else {
      listName = '默认'
    }

    const word = getjson('wordData', listName, dir)
    if (word[q] == null) {
      word[q] = []
    }
    if (word[q][a]) return (`  [ 词库核心 ]  该词条已存在于词库【${listName}】，序号为【${word[q].indexOf(a) + 1}】`)
    const num = word[q].push(a)
    update('wordData', listName, word, dir)
    return (`  [ 词库核心 ]  添加成功，已添加到词库【${listName}】，序号为【${num}】`)
  },

  /**
    * 删除词库
    * @param q 指定触发词
    * @param num 指定第几条回复（若为'all'则删除整个词条）
    * @param m 指定编辑者数据json：{uid:"id",name:"昵称"}
    * @return 返回为字符串，成功/失败
  */
  del (q:string, num:string, m:any, dir:any) {
    const id = m.uid
    // 获取json对象后，删除其中的一项，若删除后数组为空则删除key，存储数组
    const ku = getjson('wordconfig', 'userlist', dir)
    let word
    let outList = ''
    if (ku[id]) {
      outList = ku[id]
      word = getjson('wordData', ku[id], dir)
    } else {
      outList = '默认'
      word = getjson('wordData', '默认', dir)
    }
    if (!word[q]) { return '  [ 词库核心 ]  并未在当前库中找到相应的关键词' }
    if (num === 'all') {
      delete word[q]
    } else {
      word[q].splice(Number(num) - 1, 1)
      if (!word[q].length) {
        delete word[q]
      }
    }

    update('wordData', outList, word, dir)
    return (`  [ 词库核心 ]  删除成功，词库【${outList}】，处理成功`)
  },

  /**
    * 选择编辑词库
    * @param db 设置被编辑词库
    * @param m 设置人数据json：{uid:"id",name:"昵称"}
    * @return 返回为回复结果（成功/失败）
  */
  in (db:string, m:any, dir:any) {
    const uid = m.uid
    const list = getjson('wordconfig', 'userlist', dir)
    list[uid] = db
    update('wordconfig', 'userlist', list, dir)
    return ` [词库核心] 设置成功，接下来您添加的词库将添加至【${db}】词库`
  },

  /**
      * 恢复编辑默认词库
      * @param m 设置人数据json：{uid:"id",name:"昵称"}
      * @return 返回为回复结果（成功/失败）
    */
  out (m:any, dir:any) {
    const uid = m.uid
    const list = getjson('wordconfig', 'userlist', dir)
    try {
      delete list[uid]
      update('wordconfig', 'userlist', list, dir)
      return ' [词库核心] 设置成功，将添加至【默认】词库'
    } catch (err) { return ' [词库核心] 设置失败' }
  },

  /**
    * 增加词库管理员
    * @name 唯一标识（字符串）
    * @return 返回为结果（字符串）
  */
  op (name:string, dir:any) {
    let id = ''
    const a = name.match(/\s*\[@(.*?)@\]\s*/)
    if (a) {
      id = a[1]
    }
    const adminlist = getjson('wordconfig', 'adminlist', dir)
    if (adminlist.admin.indexOf(id) < 0) {
      adminlist.admin.push(id)
    }
    update('wordconfig', 'adminlist', adminlist, dir)
    return ' [词库核心] 词库管理员设置成功...!'
  },

  /**
    * 去除词库管理员
    * @name 唯一标识（字符串）
    * @return 返回为结果（字符串）
  */
  deop (name:string, dir:any) {
    let id = ''
    const a = name.match(/\s*\[@(.*?)@\]\s*/)
    if (a) {
      id = a[1]
    }
    const adminlist = getjson('wordconfig', 'adminlist', dir)
    if (adminlist.admin.indexOf(id) >= 0) {
      adminlist.admin.splice(adminlist.admin.indexOf(id), 1)
    }
    update('wordconfig', 'adminlist', adminlist, dir)
    return ' [词库核心] 词库管理员取消成功...!'
  },

  /**
    * 删除某一词库
    * @param name 需要删除的词库
    * @return 返回结果
  */
  over (name:string, dir:any) {
    try {
      fs.unlinkSync(path.join(dir, `./word/wordData/${name}.json`))
      return ' [词库核心] 删除词库成功 '
    } catch (err) {
      return ' [词库核心] 词库可能不存在 '
    }
  }
}
