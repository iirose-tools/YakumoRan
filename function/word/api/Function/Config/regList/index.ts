import { regList } from './iirose'
// import { messageReg } from './qq

export const messageReg = () => {
  const outRegList: { list: [RegExp, string, string][], item: RegExp } = {
    list: [],
    item: /test/
  }

  let item = ''
  regList.forEach(element => {
    outRegList.list.push([element[0], element[1], element[2]])
    const str = element[0].toString()
    item = item + '|' + str.slice(1, str.length - 1)
  })

  outRegList.item = RegExp(item.substr(1))

  return outRegList
}
