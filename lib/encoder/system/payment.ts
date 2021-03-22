export default (uid: string, money: number, message: string = '') => {
  const data = JSON.stringify({
    g: uid,
    c: money,
    m: message
  });
  return `+$${data}`
}