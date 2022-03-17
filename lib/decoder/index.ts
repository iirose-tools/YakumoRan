import damaku from './damaku'
import JoinRoom from './JoinRoom'
import LeaveRoom from './LeaveRoom'
import MoveToRoom from './SwitchRoom'
import Music from './Music'
import paymentCallback from './paymentCallback'
import PrivateMessage from './PrivateMessage'
import PublicMessage from './PublicMessage'
import userlist from './userlist'
import GetUserListCallback from './GetUserListCallback'
import UserProfileCallback from './UserProfileCallback'
import BankCallback from './BankCallback'
import MediaListCallback from './MediaListCallback'
import SelfMove from './SelfMove'
import MailboxMessage from './MailboxMessage'

export default (msg: string) => {
  const status = []

  status.push(userlist(msg))
  status.push(PublicMessage(msg))
  status.push(LeaveRoom(msg))
  status.push(JoinRoom(msg))
  status.push(PrivateMessage(msg))
  status.push(damaku(msg))
  status.push(MoveToRoom(msg))
  status.push(Music(msg))
  status.push(paymentCallback(msg))
  status.push(GetUserListCallback(msg))
  status.push(UserProfileCallback(msg))
  status.push(BankCallback(msg))
  status.push(MediaListCallback(msg))
  status.push(SelfMove(msg))
  status.push(MailboxMessage(msg))

  const len = status.filter(e => !!e).length

  return len > 0
}
