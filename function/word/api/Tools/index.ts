import * as fs from 'fs'
import * as path from 'path'

export const command = {
  /**
  * 返回一个文件的json对象
  * @param dir 文件目录
  * @param list 词库文件目录（wordConfig/userData/wordList/recycleBin）
  * @param name 词库文件名
  * @return 词库json对象
  */
  getjson: (dir: string, list: string, name: string) => {
    const wordPath = path.join(dir, `./word/${list}/${name}.json`)
    if (!fs.existsSync(wordPath)) {
      fs.writeFileSync(wordPath, '{}')
    }

    return JSON.parse(fs.readFileSync(wordPath).toString())
  },
  /**
  * 将词库json对象存储在文件内
  * @param dir data文件目录
  * @param list 词库文件目录
  * @param name 词库文件名
  * @param file 词库json对象
  */
  update: (dir: string, list: string, name: string, file: { [key: string]: any }) => {
    try {
      fs.writeFileSync(path.join(dir, `./word/${list}/${name}.json`), JSON.stringify(file, null, 3))
    } catch (error) {
    }
  },
  /**
   * 生成随机数
   * @param n 区间a
   * @param m 区间b
   * @returns 结果
   */
  random: (n: number, m: number): number => {
    return Math.floor(Math.random() * (m - n + 1) + n)
  }
}

// 定义词库缓存变量的类型
type wordCache = {
  passive: { [key: string]: string[] }
  keys: string[],
  wordList: string[],
  recycleBinList: string[],
  initiative: { [key: string]: string[] }
}

export const wordCommand = {
  /**
   * 获取全局数据
   * @param dir data文件目录
   * @returns 结果
   */
  getCacheWord: (dir: string) => {
    const wordListArr = fs.readdirSync(path.join(dir, 'word/wordList'))

    const recycleBinArr = fs.readdirSync(path.join(dir, 'word/recycleBin'))

    const CacheObj: wordCache = {
      recycleBinList: recycleBinArr,
      keys: [],
      passive: {},
      initiative: {},
      wordList: []
    }

    for (const a of wordListArr) {
      const name = a.replace('.json', '')
      const data = command.getjson(dir, 'wordList', name)
      const keysArr = (!data.main) ? [] : Object.keys(data.main)
      const initiativeKey = (!data.initiative) ? [] : Object.keys(data.initiative)

      if (!CacheObj.wordList) { CacheObj.wordList = [] } // 将本词库名放入缓存
      CacheObj.wordList.push(name)

      for (const item of keysArr) {
        if (!CacheObj.passive[item]) { CacheObj.passive[item] = [] }
        CacheObj.passive[item].push(name) // 将此触发词所在的词库放入缓存

        if (CacheObj.keys.indexOf(item) < 0) { CacheObj.keys.push(item) }
      }

      for (const item2 of initiativeKey) {
        if (!CacheObj.initiative[item2]) { CacheObj.initiative[item2] = [] }
        CacheObj.initiative[item2] = CacheObj.initiative[item2].concat(data.initiative[item2])
      }
    }
    return CacheObj
  }
}

/*
  wordCacheObj = {
      passive: { 触发词: [所拥有的词库] }
      keys : [所有的触发词],
      wordList : [所有的库名称],
      recycleBinList: [回收站列表],
      initiative: { 主动触发词:[所拥有的词库] }
    }
*/
