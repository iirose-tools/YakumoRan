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

export default (msg: string) => {
  const status = [];
  
  status.push(userlist(msg));
  status.push(PublicMessage(msg));
  status.push(LeaveRoom(msg));
  status.push(JoinRoom(msg));
  status.push(PrivateMessage(msg));
  status.push(damaku(msg));
  status.push(like(msg));
  status.push(MoveToRoom(msg));
  status.push(Music(msg));
  status.push(paymentCallback(msg));
  
  status.filter(e => e);

  if(status.length > 0) return true;
  return false;
}