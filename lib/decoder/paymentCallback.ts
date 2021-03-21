import { Bot } from "../event";

export interface paymentCallback {
  money: number
}

export default (message: string) => {
  if(message.substr(0, 2) === '|$') {
    Bot.emit("paymentCallback", {
      money: Number(message.substr(2))
    });
    return true;
  }
}