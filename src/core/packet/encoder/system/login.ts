import md5 from '../../../utils/md5'

export default (username: string, password: string, room: string, roomPassword?: string) => {
  const data = {
    r: room,
    rp: roomPassword || '',
    n: username,
    p: password,
    st: 'n',
    mo: '',
    mb: '',
    mu: '01',
    fp: `@${md5(username)}`
  }

  return `*${JSON.stringify(data)}`
}
