import lock from 'locks'
import { Role } from './role'
import fs from 'fs'

// 狼投票用的锁
export const WolfLock = lock.createMutex()

// 所有狼的身份列表
export const WolfRoleList = [
  'AlphaWolf',
  'WW'
]

export const getRole = (total: number, type: 'Fire' | 'Wolf') => {
  const shuffle = (arr: any[]) => {
    let n = arr.length
    let random
    while (n !== 0) {
      random = (Math.random() * n--) >>> 0; // 无符号右移位运算符向下取整
      [arr[n], arr[random]] = [arr[random], arr[n]] // ES6的结构赋值实现变量互换
    }
    return arr
  }

  const list = []

  const Roles = shuffle([
    Role.AppS, // 先知学徒
    Role.Fool, // 笨蛋先知
    Role.Thief, // 小偷
    Role.Hunter, // 猎人
    Role.VG, // 村民
    Role.VG // 村民
  ])

  if (type === 'Fire') {
    // 纵火局
    list.push(Role.Fire) // 纵火犯
    list.push(Role.Seer) // 先知
    list.push(Role.VG) // 村民
    list.push(Role.Tanner) // 圣战者
    list.push(Role.VG) // 村民
    list.push(Role.Mage) // 女巫
  } else if (type === 'Wolf') {
    // 狼人局
    list.push(Role.WW) // 狼人
    list.push(Role.Tanner) // 圣战者
    list.push(Role.VG) // 村民
    list.push(Role.Seer) // 先知
    list.push(Role.Mage) // 女巫

    if (total >= 8) list.push(Role.AlphaWolf) // 人数大于8人就使用头狼
    if (total < 8) list.push(Role.WW) // 狼
  }

  const left = total - list.length

  for (let i = 0; i < left; i++) list.push(Roles.pop() || Role.VG)

  return shuffle(list)
}

export const deleteFolder = (filePath: string) => {
  if (fs.existsSync(filePath)) {
    const files = fs.readdirSync(filePath)
    files.forEach((file) => {
      const nextFilePath = `${filePath}/${file}`
      const states = fs.statSync(nextFilePath)
      if (states.isDirectory()) {
        deleteFolder(nextFilePath)
      } else {
        fs.unlinkSync(nextFilePath)
      }
    })
    fs.rmdirSync(filePath)
  }
}
