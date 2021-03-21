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
  userlist(msg);
  PublicMessage(msg);
  LeaveRoom(msg);
  JoinRoom(msg);
  PrivateMessage(msg);
  damaku(msg);
  like(msg);
  MoveToRoom(msg);
  Music(msg);
  paymentCallback(msg);
}