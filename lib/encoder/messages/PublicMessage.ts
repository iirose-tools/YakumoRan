export default (message: string, color: string) => {
  if (message === 'cut') {
    return `{0${JSON.stringify({
      m: message,
      mc: color,
      i: Math.random().toString().substr(2, 12)
    })}`
  }
  return JSON.stringify({
    m: message,
    mc: color,
    i: Math.random().toString().substr(2, 12)
  })
}
