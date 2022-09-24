export interface SelfMove {
  id: string
}

export default (message: string): [string, SelfMove][] | undefined => {
  if (message.substring(0, 2) === '-*') {
    const msg = {
      id: message.substring(2)
    }

    return [['SelfMove', msg]]
  }
}
