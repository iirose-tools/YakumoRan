export default (message: string, color: string) => {
  return JSON.stringify({
    m: message,
    mc: color,
    i: Math.random().toString().substr(2, 12)
  });
}