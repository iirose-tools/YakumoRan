import * as api from '../Tools/index'
let dir: string

/**
* 返回一个文件的json对象
* @param list 词库文件目录（wordConfig/userData/wordList/recycleBin）
* @param name 词库文件名
* @return 词库json对象
*/
const getjson = (list: string, name: string) => { return api.command.getjson(dir, list, name) }

/**
* 将词库json对象存储在文件内
* @param list 词库文件目录
* @param name 词库文件名
* @param file 词库json对象
*/
const update = (list: string, name: string, file: any) => { return api.command.update(dir, list, name, file) }

export default class {
  /**
   * 设定权限组文件位置
   * @param inDir 数据存储位置
   */
  constructor (inDir: string) {
    dir = inDir
  }

  /**
   * 添加权限
   * @param persName 权限名称
   * @param id 需修改者id
   * @returns 结果
   */
  add (persName: string, id: string) {
    const persObj = getjson('wordConfig', 'permissions')

    if (!persObj[id]) { persObj[id] = [] }
    persObj[id].push(persName)

    update('wordConfig', 'permissions', persObj)

    return ' [词库核心] 权限修改成功 '
  }

  /**
   * 删除权限
   * @param persName 权限名称
   * @param id 需修改者id
   * @returns 返回结果
   */
  del (persName: string, id: string) {
    const persObj = getjson('wordConfig', 'permissions')
    if (!persObj[id]) { return ' [词库核心] 你不存在此权限' }

    const index = persObj[id].indexOf(persName)

    persObj[id].splice(index, 1)

    update('wordConfig', 'permissions', persObj)

    return ' [词库核心] 权限修改成功 '
  }

  /**
   * 是否有某个权限
   * @param persName 权限名
   * @param id 查询id
   * @returns boolean
   */
  have (persName: string, id: string) {
    const persObj = getjson('wordConfig', 'permissions')
    if (!persObj[id]) { return false }

    return isHava(persObj[id], persName)
  }

  /**
   * 查看一个人的全部权限
   * @param persName 权限名
   * @param id 查询id
   * @returns 权限数组
   */
  all (persName: string, id: string) {
    const persObj = getjson('wordConfig', 'permissions')
    if (!persObj[id]) { persObj[id] = [] }

    return persObj[id]
  }

  /**
   * 查询拥有某权限的id列表
   * @param persName 权限名
   * @returns id列表
   */
  list (persName: string) {
    const persObj = getjson('wordConfig', 'permissions')
    const outArr:string[] = []

    for (const a in persObj) {
      if (isHava(persObj[a], persName)) { outArr.push(a) }
    }

    return outArr
  }
}

/**
 * 是否含有某权限
 * @param i 我的权限列表(数组)
 * @param permissionsName 需查权限
 * @returns boolean
 */
const isHava = (i: string[], permissionsName: string) => {
  const findNode = permissionsName.split('.')

  for (const node of i) {
    if (node === permissionsName) { return true }
    const nodeList = node.split('.')

    for (let index = 0; index < nodeList.length; index++) {
      if (nodeList[index] === '*') { return true }
      if (nodeList[index] !== findNode[index]) { break }
    }
  }

  return false
}
