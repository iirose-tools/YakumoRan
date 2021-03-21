import damaku from './damaku';
import JoinRoom from './JoinRoom';
import LeaveRoom from './LeaveRoom';
import like from './like';
import MoveToRoom from './SwitchRoom';
import Music from './Music';
import paymentCallback from './paymentCallback';
import PrivateMessage from './PrivateMessage';
import PublicMessage from './PublicMessage';
import userlist from './userlist';

export default (msg: string): boolean => {
  const stats = {
    p: false,
  }
  
  stats.p = (userlist(msg) && !stats.p) ? true : false;
  stats.p = (PublicMessage(msg) && !stats.p) ? true : false;
  stats.p = (LeaveRoom(msg) && !stats.p) ? true : false;
  stats.p = (JoinRoom(msg) && !stats.p) ? true : false;
  stats.p = (PrivateMessage(msg) && !stats.p) ? true : false;
  stats.p = (damaku(msg) && !stats.p) ? true : false;
  stats.p = (like(msg) && !stats.p) ? true : false;
  stats.p = (MoveToRoom(msg) && !stats.p) ? true : false;
  stats.p = (Music(msg) && !stats.p) ? true : false;
  stats.p = (paymentCallback(msg) && !stats.p) ? true : false;
  
  return stats.p;
}