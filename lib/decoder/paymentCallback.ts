export interface paymentCallback {
  money: number
}

export default (message: string) => {
  if(message.substr(0, 2) === '|$') {
    return {
      money: Number(message.substr(2))
    };
  }

  return null;
}