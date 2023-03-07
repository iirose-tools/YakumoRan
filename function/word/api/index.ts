import Editor from './Editor/index'
import Driver from './Driver'
import Permissions from './Permissions'
import * as fs from 'fs'
import * as path from 'path'
import { config } from './Function/Config/conventional'

const dir = config.dir
export const editor = new Editor(dir)
export const permissions = new Permissions(dir)

const cacheObj = editor.getCacheWord()

export const driver = new Driver(cacheObj, dir)

/**
 * 导出外部的主动触发函数
 * @param q 主动触发词
 * @param playData 触发者数据
 * @returns 结果
 */
export const initiative = (q: string, playData: { [key: string]: string }) => { return driver.initiativeStart(q, playData) }

// 加载额外主动库
fs.readdirSync(path.join(__dirname, './Function/initiative/')).forEach((value) => {
  require(path.join(__dirname, './Function/initiative/', value))
})
