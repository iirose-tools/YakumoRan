export default (operation: "<" | ">", time: string) => {
  return `!15["${operation}","${time}"]`
}