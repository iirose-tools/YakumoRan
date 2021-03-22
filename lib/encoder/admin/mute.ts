export default (type: "chat" | "music" | "all", username: string, time: string, intro: string) => {
  const typeMap: any = {
    "chat": "41",
    "music": "42",
    "all": "43"
  }
  
  return `!h3["${typeMap[type]}","${username}","${time}","${intro}"]`
}