import * as fs from 'fs'
import * as path from 'path'
import * as api from '../Tools/index'
// import axios from 'axios'

let wordDir = ''

/**
* 返回一个文件的json对象
* @param list 词库文件目录（wordConfig/userData/wordList/recycleBin）
* @param name 词库文件名
* @return 词库json对象
*/
const getjson = (list: string, name: string) => { return api.command.getjson(wordDir, list, name) }

/**
* 将词库json对象存储在文件内
* @param list 词库文件目录
* @param name 词库文件名
* @param file 词库json对象
*/
const update = (list: string, name: string, file: object) => { return api.command.update(wordDir, list, name, file) }

// 定义词库缓存变量的类型
type wordCache = {
  passive: { [key: string]: string[] }
  keys: string[],
  wordList: string[],
  recycleBinList: string[],
  initiative: { [key: string]: string[] }
}

/**
 * 获取词库编辑指针
 * @param id 编辑者id
 * @returns 词库名
 */
const getPointer = (id: string) => {
  const pointer = getjson('wordConfig', 'pointer')
  if (!pointer[id]) { pointer[id] = '默认' }
  update('wordConfig', 'pointer', pointer)
  return pointer[id]
}

export default class {
  wordObj: wordCache

  /**
   * 新建词库对象
   * @param dir 词库数据根文件夹
   */
  constructor (dir: string) {
    wordDir = dir

    try { fs.mkdirSync(path.join(dir)) } catch (err) { }
    try { fs.mkdirSync(path.join(dir, 'word')) } catch (err) { }
    try { fs.mkdirSync(path.join(dir, 'word/wordList')) } catch (err) { }
    try { fs.mkdirSync(path.join(dir, 'word/userData')) } catch (err) { }
    try { fs.mkdirSync(path.join(dir, 'word/wordConfig')) } catch (err) { }
    try { fs.mkdirSync(path.join(dir, 'word/recycleBin')) } catch (err) { }
    this.wordObj = this.getCacheWord()
  }

  /**
   * 获取词库缓存对象
   * @returns 词库对象
   */
  getCacheWord () { return api.wordCommand.getCacheWord(wordDir) }

  /**
   * 添加问答
   * @param q 触发词
   * @param a 回复句
   * @param id 编写者id
   * @returns 结果
   */
  add (q: string, a: string, id: string) {
    const pointer = getPointer(id)
    const word = getjson('wordList', pointer)
    let feedback: string = ''

    if (!word.main) {
      word.author = [id]
      word.backpack = []
      word.main = {}
      word.cache = (pointer === '默认') ? '默认' : pointer
    }

    if (!word.main[q]) { word.main[q] = [] }
    word.main[q].push(a)

    feedback = ` [词库核心] 添加成功，保存为【${pointer}】库，序号为【${word.main[q].length}】`
    if (this.wordObj.passive[q]) {
      feedback = feedback + '\n\n此触发词也在以下库存在：\n' + this.wordObj.passive[q].join('\n')
    }

    update('wordList', pointer, word)
    this.wordObj = this.getCacheWord()// 此处可选优化，手动添加到缓存，而不是刷新缓存，下方的以此类推
    return feedback
  }

  /**
   * 删除问答
   * @param q 触发词
   * @param index 序号<数字/all>
   * @param id 编辑者id
   * @returns 结果
   */
  del (q: string, index: string, id: string) {
    const pointer = getPointer(id)
    const word = getjson('wordList', pointer)

    if (!word.main[q]) { return ' [词库核心] 当前词库不存在您要删除的问答' }

    if (index === 'all') {
      delete word.main[q]
    } else if (/\d+/.test(index)) {
      if (Number(index) > word.main[q].length) { return ' [词库核心] 您输入的序号不存在' }
      word.main[q].splice(Number(index) - 1, 1)
      if (word.main[q].length <= 0) { delete word.main[q] }
    } else {
      return ' [词库核心] 您输入的可能不是一个正确的数值，删除仅能够为<数字 / all>'
    }

    update('wordList', pointer, word)
    this.wordObj = this.getCacheWord()
    return ` [词库核心] 删除【${pointer}】库选中的问答成功`
  }

  /**
   * 查看关键词的所有回答
   * @param q 关键词
   * @param id 查询者id
   * @returns 结果
   */
  list (q: string, id: string) {
    const pointer = getPointer(id)
    const word = getjson('wordList', pointer)
    let out = ''
    let i = 0

    if (!word.main[q]) { return ' [词库核心] 当前词库不存在您要删除的问答' }

    word.main[q].forEach((element:string) => {
      i++
      out = out + `\n ${i}. ${element}`
    })

    return ` [词库核心] 该词库含有：${out}`
  }

  /**
   * 寻找触发词
   * @param q 所寻找的触发词(正则字符串)
   * @returns 结果
   */
  findQuestion (q: string) {
    let out = ''

    for (const a of this.wordObj.keys) {
      if (RegExp(q).test(a)) { out = out + `\n触发词 : 【${a}】 存在于  【${this.wordObj.passive[a].join(',')}】` }
    }

    return ` [词库核心] 当前:\n${out}`
  }

  /**
   * 寻找词库
   * @param listName 需要寻找的词库名
   * @returns 结果
   */
  findList (listName: string) {
    let out = ''

    if (listName === 'all') { return ` [词库核心] 发现了以下词库 \n\n ${this.wordObj.wordList.join('\n')} ` }

    for (const a of this.wordObj.wordList) {
      if (RegExp(listName).test(a)) {
        out = out + `${a}\n`
      }
    }

    return ` [词库核心] 发现了以下词库 \n\n ${out} `
  }

  /**
   * 查看某个词库包含的关键词
   * @param dbName 查询的词库名称
   * @returns 结果
   */
  passiveList (dbName: string) {
    if (this.wordObj.wordList.indexOf(dbName) === -1) { return ' [词库核心] 此词库并不存在！' }

    const word = getjson('wordList', dbName)
    const keys = Object.keys(word.main)
    let out = ''

    for (let i = 0; i < keys.length; i++) {
      out = out + `${i}. ${keys[i - 1]} \n`
    }

    return ` [词库核心] 此词库包含: \n\n ${out}`
  }

  /**
   * 更改编辑指针
   * @param pointerName 指针名
   * @param id 编辑者id
   * @returns 结果
   */
  changePointer (pointerName: string, id: string) {
    const pointer = getjson('wordConfig', 'pointer')

    if (!pointer[id]) { pointer[id] = '默认' }
    pointer[id] = pointerName

    update('wordConfig', 'pointer', pointer)
    return ' [词库核心] 指针已变更'
  }

  /**
   * 重置编辑指针
   * @param id 编辑者id
   * @returns 结果
   */
  resetPointer (id: string) {
    const pointer = getjson('wordConfig', 'pointer')
    pointer[id] = '默认'

    update('wordConfig', 'pointer', pointer)
    return ' [词库核心] 指针重置成功'
  }

  /**
   * 移动词库至回收站
   * @param dbName 词库名
   * @returns
   */
  killList (dbName: string) {
    if (this.wordObj.wordList.indexOf(dbName) === -1) { return ' [词库核心] 此词库不存在' }

    try {
      const userData = fs.readdirSync(path.join(wordDir, './word/recycleBin'))
      let newName = dbName.repeat(1)
      if (userData.includes(`${dbName}.json`)) { newName = `${newName}_bak` }

      fs.renameSync(path.join(wordDir, `word/wordList/${dbName}.json`), path.join(wordDir, `word/recycleBin/${newName}.json`))
      this.wordObj = this.getCacheWord()

      return ' [词库核心] 移动至回收站成功'
    } catch (err) {
      return ' [词库核心] 移动至回收站时遇到错误'
    }
  }

  /**
   * 清空回收站
   * @returns 返回结果
   */
  clearBackup () {
    const needClearList = this.wordObj.recycleBinList
    try {
      for (const a of needClearList) {
        fs.unlinkSync(path.join(wordDir, `word/wordList/${a}`))
      }
      this.wordObj = this.getCacheWord()
      return ' [词库核心] 回收站清理成功！'
    } catch (err) {
      this.wordObj = this.getCacheWord()
      return ' [词库核心] 清空回收站失败'
    }
  }

  /**
   * 还原回收站内的词库
   * @param dbName 词库名
   * @returns 结果
   */
  recoveryList (dbName: string) {
    if (this.wordObj.recycleBinList.indexOf(dbName) === -1) { return ' [词库核心] 回收站不存在此词库' }
    try {
      fs.renameSync(path.join(wordDir, `word/recycleBin/${dbName}.json`), path.join(wordDir, `word/wordList/${dbName}.json`))
      this.wordObj = this.getCacheWord()

      return ' [词库核心] 从回收站内还原成功'
    } catch (err) {
      return ' [词库核心] 还原遇到错误'
    }
  }

  /**
   * 查看回收站列表
   * @returns 结果
   */
  backupList () {
    const out = this.wordObj.recycleBinList.join('\n')
    return ` [词库核心] 当前回收站拥有：\n\n${out}`
  }

  /**
   * 直接删除词库
   * @param dbName 词库名
   * @returns 结果
   */
  mandatoryDelete (dbName: string) {
    if (this.wordObj.wordList.indexOf(dbName) === -1) { return ' [词库核心] 此词库不存在' }
    try {
      fs.unlinkSync(path.join(wordDir, `word/wordList/${dbName}.json`))
      this.wordObj = this.getCacheWord()

      return ' [词库核心] 词库删除成功'
    } catch (err) {
      return ' [词库核心] 词库删除时遇到错误'
    }
  }

  /**
   * 添加开发者
   * @param tid 对方id
   * @param mid 我的id
   * @returns 结果
   */
  addWriter (tid: string, mid: string) {
    const pointer = getPointer(mid)
    const word = getjson('wordList', pointer)
    const author = word.author

    if (pointer === '默认') { return ' [词库核心] 此词库为公共词库，无法修改' }
    if (!word.author) { return ' [词库核心] 此词库为空词库' }
    if (author[0] !== mid) { return '[词库核心] 此词库主作者并非是您' }

    word.author.push(tid)
    update('wordList', pointer, word)
    this.wordObj = this.getCacheWord()
    return ' [词库核心] 当期词库开发者新增一位'
  }

  /**
   * 删除某词库作者
   * @param tid 对方的id
   * @param mid 我的id
   * @returns 结果
   */
  rmWriter (tid: string, mid: string) {
    const pointer = getPointer(mid)
    const word = getjson('wordList', pointer)
    const author = word.author

    if (pointer === '默认') { return ' [词库核心] 此词库为公共词库，无法修改' }
    if (!word.author) { return ' [词库核心] 此词库为空词库' }
    if (author[0] !== mid) { return '[词库核心] 此词库主作者并非是您' }

    const index = word.author.indexOf(tid)
    if (index > -1) {
      word.author.splice(index, 1)
      this.wordObj = this.getCacheWord()
      return ' [词库核心] 删除词库作者成功'
    } else {
      this.wordObj = this.getCacheWord()
      return ' [词库核心] 此词库作者列表中并不包含对方'
    }
  }

  /**
   * 查看创作者列表
   * @param dbName 词库名
   * @returns Array
   */
  viewWriter (dbName: string) {
    const word = getjson('wordList', dbName)
    if (!word.author) { return null }

    return word.author
  } // 谁是编写者(这边不封装，后期为花园手动封装)

  /**
   * 判断对方是否为作者
   * @param id 寻找id
   * @param dbname 词库名
   * @returns true/false
   */
  isWriter (id: string) {
    const dbName = getPointer(id)
    const adminList = this.viewWriter(dbName)
    if (!adminList) return ' [词库核心] isWriter出现异常'

    if (adminList.includes(id)) {
      return true
    } else {
      return false
    }
  }

  /**
   * 设定背包清单值
   * @param mid 编辑者id
   * @param itemName 物品名称
   * @returns 结果
   */
  setPack (mid: string, itemName: string) {
    const pointer = getPointer(mid)
    const word = getjson('wordList', pointer)

    if (word.backpack.indexOf(itemName) > -1) {
      return ' [词库核心] 该物品已存在清单中'
    } else {
      word.backpack.push(itemName)
      this.wordObj = this.getCacheWord()

      update('wordList', pointer, word)
      return ' [词库核心] 该物品已添加至清单'
    }
  }

  /**
   * 删除背包清单中的某一项
   * @param mid 编辑者id
   * @param itemName 物品名称
   * @returns 结果
   */
  delPack (mid: string, itemName: string) {
    const pointer = getPointer(mid)
    const word = getjson('wordList', pointer)
    const index = word.backpack.indexOf(itemName)

    if (index > -1) {
      word.backpack.splice(index, 1)
      this.wordObj = this.getCacheWord()

      return ' [词库核心] 该物品已从清单中移除'
    } else {
      update('wordList', pointer, word)
      return ' [词库核心] 该物品不存在清单中'
    }
  }

  /**
   * 查看的背包清单
   * @param mid 触发者id
   * @returns 返回结果
   */
  listPack (mid: string) {
    const pointer = getPointer(mid)
    const word = getjson('wordList', pointer)

    return ` [词库核心] 该背包设定的物品清单为：\n\n ${word.backpack.join('\n')}`
  }

  /**
   * 添加主动式词库
   * @param q 触发式
   * @param a 回答词
   * @param id 编辑者id
   * @returns 结果
   */
  whenOn (q: string, a: string, id: string) {
    const pointer = getPointer(id)
    const word = getjson('wordList', pointer)

    if (!word.initiative) { word.initiative = {} }
    if (!word.initiative[q]) { word.initiative[q] = [] }

    word.initiative[q].push(a)

    update('wordList', pointer, word)
    this.wordObj = this.getCacheWord()

    return ` [词库核心] 更新成功，当前序号为【${word.initiative[q].length}】`
  }

  /**
   * 删除主动词库
   * @param q 主动触发词
   * @param index 序号
   * @param id 编辑者id
   * @returns 结果
   */
  whenOff (q: string, index: string, id: string) {
    const pointer = getPointer(id)
    const word = getjson('wordList', pointer)

    if (index === 'all') {
      delete word.initiative[q]
    } else if (/\d+/.test(index)) {
      const num = Number(index)
      if (num > word.initiative[q].length) { return ' [词库核心] 输入的可能不是一个合理的序号哦 ' }
      word.initiative[q].splice(num - 1, 1)
    } else {
      return ' [词库核心] 输入的可能不是一个合理的序号哦 '
    }

    update('wordList', pointer, word)
    this.wordObj = this.getCacheWord()

    return ` [词库核心] 更新成功，当前序号为【${word.initiative[q].length}】`
  }

  /**
   * 修改词库的存储库
   * @param newCacheName 新库名
   * @param id 编辑者id
   * @returns 结果
   */
  changCache (newCacheName: string, id: string) {
    const pointer = getPointer(id)
    const word = getjson('wordList', pointer)

    if (word.author[0] !== id) { return ' [词库核心] 您不是第一作者，无法修改' }

    word.cache = newCacheName

    update('wordList', pointer, word)
    this.wordObj = this.getCacheWord()

    return ' [词库核心] 修改为新库成功'
  }

  /*
  pack (mid:string, q:string, a:string) {} // 封装(暂时不做)

  upload () {} // 上传
  download () {} // 下载

  // 查询位置
  */
}

/*
  wordObj = {
    passive: { 触发词: [所拥有的词库] }
    keys : [所有的触发词],
    wordList : [所有的库名称],
    recycleBinList: [回收站列表],
    initiative: { 主动触发词:[所拥有的词库] }
  }
*/

/*
  {
    main:{ // 基础存储 },
    author: [ // 编写者 ],
    backpack: [ // 标记物品? ],
    cache: '存储库名',
    initiative: { // 主动词库 },
    function: { // js代码 }
  }
*/
/*
{
  存储库: {},
  存储库2:{}
}
*/
// Driver文件夹下有配置主动触发函数的文件 467
