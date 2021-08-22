import fs from 'fs'
import path from 'path'
import * as Ran from '../../lib/api'

/**
 * @description 自动付工资
 * @class
 */
export class autopay {
  static path = path.join(Ran.Data, '/member/option.json')
  static option: {
    [index: string]: {
      autopay: boolean,
      employer: string,
      salaryperhour: number
    }
  } = {};

  /**
  * @description 写入数据
  */
  static write () {
    return fs.writeFileSync(this.path, JSON.stringify(this.option))
  }

  /**
  * @description 读取数据
  */
  static load () {
    this.option = JSON.parse(fs.readFileSync(this.path).toString())
    return this.option
  }

  /**
  * @description 设置自动付工的选项
  */
  static set (uid: string, sal: number): string {
    uid = uid.toLocaleLowerCase()
    this.option.autopayOption = {
      autopay: false,
      employer: uid,
      salaryperhour: sal
    }
    this.write()
    return `[Member] 自动发工资：未开启， 雇主： [@${autopay.option.autopayOption.employer}@] ， 每小时工资：${this.option.autopayOption.salaryperhour}`
  }

  /**
  * @description 开启自动付工资的功能
  */
  static open () {
    if (this.option.autopayOption === undefined) return '[Member] 开启自动发工资失败: 还没设置自动发工资'
    this.option.autopayOption.autopay = true
    this.write()
    return `[Member] 自动发工资：已开启， 雇主： [@${autopay.option.autopayOption.employer}@] ， 每小时工资：${this.option.autopayOption.salaryperhour}`
  }

  /**
  * @description 关闭自动付工资的功能
  */
  static close () {
    if (this.option.autopayOption === undefined) return '[Member] 关闭自动发工资失败: 还没设置自动发工资'
    this.option.autopayOption.autopay = false
    this.write()
    return '[Member] 自动发工资：已关闭'
  }
}
