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

export const query = {
  /**
    * 获取触发词的位置
    * @param q 被寻找的触发词
    * @return 返回为搜索结果（字符串）
  */
  getas (q:string, dir:any) {
    try {
      const fileName = path.join(dir, './word/wordData')
      const list = fs.readdirSync(fileName)
      const qList:any = []
      list.forEach(function (item, index) {
        const word = JSON.parse(fs.readFileSync(path.join(fileName + `/${item}`)).toString())
        if (word[q]) {
          const name = item.match(/(.*).json/)
          if (name) {
            qList.push(name[1])
          }
        }
      })
      return (`  [ 词库核心 ]  相关询问存储于【${qList.join('  ,  ')}】词库中`)
    } catch (err) {
      return '  [词库核心]  啊哦...好像产生了未知错误....快告诉开发者...!'
    }
  },

  /**
    * 获取回复词的位置
    * @param a 被寻找的回复词
    * @return 返回为搜索结果（字符串）
  */
  getqs (a:string, dir:any) {
    try {
      const fileName = path.join(dir, './word/wordData')
      const list = fs.readdirSync(fileName)
      const aDataList:any = []
      list.forEach(function (item, index) {
        const word = JSON.parse(fs.readFileSync(path.join(fileName + `/${item}`)).toString())
        const name = item.match(/(.*).json/)
        if (name) {
          for (let i = 0; i < Object.keys(word).length; i++) {
            if (word[Object.keys(word)[i]].indexOf(a) >= 0) {
              aDataList.push(`词库【${name[1]}】  ：  问【${Object.keys(word)[i]}】  序号：【${word[Object.keys(word)[i]].indexOf(a) + 1}】`)
            }
          }
        }
      })
      return (`  [ 词库核心 ]  相关询问存储于\n ${aDataList.join('\n')}`)
    } catch (err) {
      return '  [词库核心]  啊哦...好像产生了未知错误....快告诉开发者...!'
    }
  },

  /**
    * 获取问的表
    * @param q 显示的库
    * @param m 查询者数据json：{uid:"id",name:"昵称"}
    * @return 返回为搜索结果（字符串）
  */
  alist (q:string, m:any, dir:any) {
    const ku = getjson('wordconfig', 'userlist', dir)
    let word
    let outList = ''
    if (ku[m.uid]) {
      outList = ku[m.uid]
      word = getjson('wordData', ku[m.uid], dir)
    } else {
      outList = '默认'
      word = getjson('wordData', '默认', dir)
    }

    if (word[q]) {
      let out = ''
      word[q].forEach(function (item:any, index:any) {
        out = out + `\n${index + 1}.   ` + item
      })
      return ` [词库核心]  查询到以下回答：\n\n\n ${out}`
    } else {
      return `  [ 词库核心 ]  库【 ${outList} 】 无法查询到此回答，请确定该词条存在或进入其他库查询`
    }
  },

  /**
    * 获取库的表
    * @return 返回为搜索结果（字符串）
  */
  list (dir:any) {
    const fileName = path.join(dir, './word/wordData')
    const list = fs.readdirSync(fileName)
    const kulist:any = []
    list.forEach(function (item, index) {
      const name = item.match(/(.*).json/)
      if (name) {
        kulist.push(name[1])
      }
    }
    )
    return ` [词库核心] 当前拥有这些库：【${kulist.join(' ， ')}】`
  },

  /**
    * 查询相关的库
    * @return 返回为搜索结果（字符串）
  */
  findList (keyWord:string, dir:any) {
    const fileName = path.join(dir, './word/wordData')
    const list = fs.readdirSync(fileName)
    const kulist:any = []
    list.forEach(function (item, index) {
      const name = item.match(/(.*).json/)
      if (name) {
        if (name[1].indexOf(keyWord) >= 0) { kulist.push(name[1]) }
      }
    }
    )
    return ` [词库核心] 当前拥有这些库：【${kulist.join(' ， ')}】`
  },

  /**
    * 获取库内的问表
    * @name 库名（字符串）
    * @return 返回为搜索结果（字符串）
  */
  qlist (name:string, dir:any) {
    const word = getjson('wordData', name, dir)
    const outlist = []
    for (let i = 0; i < Object.keys(word).length; i++) {
      outlist.push(`${i + 1}.       ${Object.keys(word)[i]}`)
    }
    return ` [词库核心] 搜索到的库内含有以下的触发词 ： \n\n ${outlist.join('\n')}`
  },

  /**
    * 查询排行榜
    * @itemName 查询的物品（字符串），切记只能查询物品，不能查询文字
    * @return 返回为结果（字符串）
  */
  leaderboard (itemName:string, dir:any) {
    try {
      const pathName = path.join(dir, './word/userData')
      const list = fs.readdirSync(pathName)
      const dataList:any = {}
      list.forEach(function (item, index) {
        const word = JSON.parse(fs.readFileSync(path.join(pathName + `/${item}`)).toString())
        const str = item.match(/(.*).json/)
        if (str) {
          if (word[itemName]) {
            dataList[`${word[itemName]}`] = str[1]
          }
        }
      })
      const test = Object.keys(dataList).map(function (item:any) {
        return Number(item)
      })
      test.sort(function (a:number, b:number) { return b - a })
      let out = ''
      let num = 0
      test.forEach(function (item, index) {
        num++
        out = out + `\n${num} : 【  [@${dataList[test[num - 1]]}@]  】 - ${test[num - 1]}`
      })
      return (`  [ 词库核心 ]  相关询问存储于\n ${out}`)
    } catch (err) {
      return '  [词库核心]  啊哦...好像产生了未知错误....快告诉开发者...!'
    }
  }
}
