export default (type: 'music' | 'video', title: string, signer: string, cover: string, link: string, url: string, duration: number) => {
  const typeMap = {
    music: 0,
    video: 1
  }

  const data = JSON.stringify({
    b: `=${typeMap[type]}`,
    c: cover.substring(4),
    d: duration,
    n: title,
    o: link.substring(4),
    r: signer,
    s: url.substring(4)
  })

  return `&1${data}`
}
