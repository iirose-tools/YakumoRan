export default (username: string, time: string, intro?: string) => {
  return `!hw["4","${username}","${time}","${intro || "undefined"}"]`
}