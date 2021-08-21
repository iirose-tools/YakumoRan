import * as Ran from '../../lib/api'
import { utils } from './utils'
import { Member } from './Member'
import logger from '../../lib/logger'
import config from '../../config'
import { autopay } from './Autopay'

// 一些操作
export class Actions {
/**
 * 更新在线状态
 */
  static async update () {
    if (Member.users === {}) {
      logger('member').info('没有员工，跳过数据更新')
      return
    }
    let index: number = 0
    const list = await Ran.method.utils.getUserList()
    for (const uid of Object.keys(Member.users)) {
      index = 0
      do {
        if (uid === list[index].uid.toLocaleLowerCase() && list[index].room === config.account.room) {
          Member.onOnline(uid)
          index = list.length + 1
        } else if (index === list.length - 1) {
          Member.onOffline(uid)
        }
        index++
      } while (index < list.length)
    }
  }

  /**
   * 检查online的值
   */
  static checkOnline (uid: string) {
    uid = uid.toLocaleLowerCase()
    return Member.users[uid].online
  }
}

/**
 * 自动付工资的操作
 * @class
 */
export class autopayAction {
/**
 * 开始
 */
  static startAutopayOperation () {
    this.checkhour()
    setTimeout(() =>
      this.checkhour(), utils.waitUntilSharp() * 1 * 60 * 1e3)

    setTimeout(() =>
      setInterval(() =>
        this.checkhour(), 60 * 60 * 1e3), utils.waitUntilSharp() * 1 * 60 * 1e3)
  }

  /**
   * 检查时间（小时）
   */
  private static checkhour () {
    if (!autopay.option.autopayOption) return Member.resetminutes()

    if (autopay.option.autopayOption.autopay === true) {
      if (new Date().getHours() === 23) {
        this.predictBeforePay(autopay.option.autopayOption.employer, autopay.option.autopayOption.salaryperhour)
      }
      if (new Date().getHours() === 0) {
        this.autopaysal(autopay.option.autopayOption.employer, autopay.option.autopayOption.salaryperhour)
      }
    } else {
      Member.resetminutes()
    }
  }

  static async predictBeforePay (employer:string, salaryperhour:number) {
    if (Object.keys(Member.users).length === 0) {
      logger('member').info('没有员工，跳过数据更新')
      return
    }
    let msg : string = '员工自动记时系统\n晚上 11:00 p.m.\n-------------------------------------\n'
    let index : number = 1
    let allmustpay : number = 0
    for (const uid of Object.keys(Member.users)) {
      const worktime = utils.calHourNMinutes(Member.users[uid].Minutes)
      const paynow : number = Number((worktime[0] * salaryperhour).toFixed(2))
      let predict = Number((paynow + salaryperhour).toFixed(2))
      if (worktime[0] === 22) predict = Number((predict + salaryperhour).toFixed(2))
      allmustpay = Number((allmustpay + predict).toFixed(2))
      msg = msg.concat(`${index}. [@${uid}@] \n目前挂机时间: ${worktime[0]}小时 ${worktime[1]}分钟\n目前应付工资：${paynow}钞\n预计应付工资：${predict}钞\n---\n`)
      index++
    }
    const list = await Ran.method.utils.getUserProfile(config.account.username)
    if (Number(list.money.hold) <= allmustpay) {
      msg = msg.concat(`-------------------------------------\n预计所有应付工资：${allmustpay}钞\n`)
      msg = msg.concat(`机器人拥有的钞：${list.money.hold}钞\n还需要：${(allmustpay - Number(list.money.hold)).toFixed(2)}钞\n为了避免失败工资付款失败，请给机器人打：${(allmustpay + 1 - Number(list.money.hold)).toFixed(2)}钞`)
      Ran.method.sendPrivateMessage(employer, msg, config.app.color)
    }
  }

  static async autopaysal (employer:string, salaryperhour:number) {
    if (Object.keys(Member.users).length === 0) {
      logger('member').info('没有员工，跳过数据更新')
      return
    }
    let allmustpay : number = 0
    let index : number = 1
    let msg : string = '员工自动记时系统\n凌晨 00:00 a.m.\n-------------------------------------\n'
    const transuid : string[] = new Array(Object.keys(Member.users).length)
    const transsal : number[] = new Array(Object.keys(Member.users).length)
    const transhour : number[] = new Array(Object.keys(Member.users).length)
    for (const uid of Object.keys(Member.users)) {
      const worktime = utils.calHourNMinutes(Member.users[uid].Minutes)
      if (worktime[0] === 23) worktime[0] = worktime[0] + 1
      const paynow = Number((worktime[0] * salaryperhour).toFixed(2))
      allmustpay = Number((allmustpay + paynow).toFixed(2))
      msg = msg.concat(`${index}. [@${uid}@] \n挂机时长: ${worktime[0]}小时\n工资：${paynow}钞\n---\n`)
      console.log(uid)
      transuid[index - 1] = uid
      transsal[index - 1] = paynow
      transhour[index - 1] = worktime[0]
      index++
    }
    const list = await Ran.method.utils.getUserProfile(config.account.username)
    if (Number(list.money.hold) <= allmustpay) {
      this.payButNotEnoughMoney(msg, Number(list.money.hold), allmustpay, employer)
    } else {
      this.proceedPayment(msg, allmustpay, employer, transsal, transhour, transuid)
    }
  }

  static payButNotEnoughMoney (msg: string, moneyhold: number, allmustpay:number, employer:string) {
    msg = msg.concat(`-------------------------------------\n钞不足：机器人拥有${moneyhold}钞\n今天需要发出的工资：${allmustpay.toFixed(2)}\n请自行发放工资`)
    Member.resetminutes()
    Ran.method.sendPrivateMessage(employer, msg, config.app.color)
  }

  static proceedPayment (msg: string, allmustpay:number, employer:string, mustpay:number[], worktime:number[], uid:string[]) {
    let index : number = 0
    do {
      if (worktime[index] !== 0) {
        Ran.method.payment(uid[index].toLocaleLowerCase(), mustpay[index], ` [_${config.account.room}_]  ： 工资: ${mustpay[index]}钞\n挂机时长: ${worktime[index]}小时`)
      }
      index++
    } while (index < uid.length)
    msg = msg.concat(`-------------------------------------\n工资已发放，总计：${allmustpay.toFixed(2)}钞\n`)
    Member.resetminutes()
    Ran.method.sendPrivateMessage(employer, msg, config.app.color)
  }
}
