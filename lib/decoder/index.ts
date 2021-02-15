import damaku from './damaku';
import JoinRoom from './JoinRoom';
import LeaveRoom from './LeaveRoom';
import like from './like';
import MoveToRoom from './MoveToRoom';
import Music from './Music';
import paymentCallback from './paymentCallback';
import PrivateMessage from './PrivateMessage';
import PublicMessage from './PublicMessage';
import userlist from './userlist';

export default (msg: string): {
  type: "UserList" |
    "PublicMessage" |
    "PrivateMessage" |
    "LeaveRoom" |
    "JoinRoom" |
    "damaku" |
    "like" |
    "UserCard" |
    "MoveToRoom" |
    "Music" |
    "paymentCallback" |
    "unknown",
  data: any
} => {
  if(userlist(msg)) return { type: 'UserList', data: userlist(msg) };
  if(PublicMessage(msg)) return { type: 'PublicMessage', data: PublicMessage(msg) };
  if(LeaveRoom(msg)) return { type: 'LeaveRoom', data: LeaveRoom(msg) };
  if(JoinRoom(msg)) return { type: 'JoinRoom', data: JoinRoom(msg) };
  if(PrivateMessage(msg)) return { type: 'PrivateMessage', data: PrivateMessage(msg) };
  if(damaku(msg)) return { type: 'damaku', data: damaku(msg) };
  if(like(msg)) return { type: "like", data: like(msg) };
  if(MoveToRoom(msg)) return { type: "MoveToRoom", data: MoveToRoom(msg) };
  if(Music(msg)) return { type: "Music", data: Music(msg) };
  if(paymentCallback(msg)) return { type: "paymentCallback", data: paymentCallback(msg) };

  return {type: 'unknown', data: null};
}