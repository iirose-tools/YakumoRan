import config from '../../../config'
import md5 from 'md5'

export default () => {
  const data = {
    r: config.account.room,
    n: config.account.username,
    p: config.account.password,
    st: 'n',
    mo: '',
    mb: '',
    mu: '01',
    fp: `@${md5(config.account.username)}`
  }

  return `*${JSON.stringify(data)}`
}
