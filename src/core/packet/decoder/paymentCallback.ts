export interface paymentCallback {
  money: number
}

export default (message: string): [string, paymentCallback][] | undefined => {
  if (message.substr(0, 2) === '|$') {
    return [[
      'PaymentCallback',
      {
        money: Number(message.substr(2))
      }
    ]]
  }
}
