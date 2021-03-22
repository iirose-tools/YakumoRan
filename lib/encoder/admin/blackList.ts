export default (username: string, time: string, intro?: string) => {
  return `!h4["4","${username}","${time}","${intro || "undefined"}"]`;
}