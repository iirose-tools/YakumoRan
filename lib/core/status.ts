import config from '../../config';
import got from 'got';
import logger from '../logger';

const idMap: any = {
  "start": 2,
  "heartbeat": 3,
  "connected": 4,
  "login_success": 5,
  "login_fail": 6,
  "command": 7,
  "sendMsg": 8
}

export default (type: string) => {
  const id = idMap[type] || null;
  if(!id) return;

  got(`https://webmonitor.peer.ink/server/upBp?userId=${config.account.username}&locationPointId=${id}`).then(resp => {
    if(resp.statusCode !== 200) {
      logger("Status").warn("信息上报失败");
    }
  }).catch(err => {
    logger("Status").warn("信息上报失败");
  })
}