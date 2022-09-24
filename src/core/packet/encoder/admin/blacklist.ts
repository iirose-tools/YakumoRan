export default (username: string, time: string, message?: string) => {
  return `!h4["4","${username}","${time}","${message || 'undefined'}"]`
}
