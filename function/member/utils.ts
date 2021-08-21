/**
 * 工具类
 * @class
 */
export class utils {
  // 过滤
  static filter (input: string): string {
    let output = input

    output = output.replace(/\[/g, '')
    output = output.replace(/\]/g, '')
    output = output.replace(/@/g, '')
    output = output.replace(/\s+/g, '')
    output = output.replace(/\//g, '')
    output = output.replace(/\\/g, '')
    output = output.replace(/\./g, '')

    return output
  }

  // uid的长度控制
  static UidLengthControl (input: string): boolean {
    return input.length === 13
  }

  // 控制工资
  static saleryControl (input: number): any {
    if (!(+input <= 3 && +input >= 0.1)) return false
  }

  // 计算距离整点还有多少分钟
  static waitUntilSharp (): number {
    const minutesleft = 60 - (new Date()).getMinutes()
    return minutesleft
  }

  static calHourNMinutes (minutes: number): number[] {
    const Hour = minutes / 60 >> 0
    const Minutes = minutes % 60
    return [Hour, Minutes]
  }
}
