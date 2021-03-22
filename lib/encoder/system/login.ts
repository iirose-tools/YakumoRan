import config from "../../../config";

export default () => {
  const data = {
    r: config.account.room,
    n: config.account.username,
    p: config.account.password,
    st: 'n',
    mo: '',
    mb: '',
    mu: '01'
  };

  return `*${JSON.stringify(data)}`;
}