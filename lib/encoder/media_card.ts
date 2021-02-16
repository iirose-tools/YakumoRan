import PublicMessage from "./PublicMessage"

export default (type: "music" | "video", title: string, singer: string, cover: string, BitRate: number, color: string) => {
  const typeMap = {
    'music': 0,
    'video': 1
  }
  const data = `m__4=${typeMap[type]}>${title}>${singer}>${cover}>${color}>${BitRate}`
  return PublicMessage(data, color)
}