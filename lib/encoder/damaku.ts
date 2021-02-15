export default (message: string, color: string) => {
  const data = {
    t: message,
    c: color
  }
  return `~${JSON.stringify(data)}`
}