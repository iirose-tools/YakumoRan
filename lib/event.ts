import { EventEmitter } from 'events'
import { SystemMessage } from './decoder/LeaveRoom'
import { PublicMessage } from './decoder/PublicMessage'
import { PrivateMessage } from './decoder/PrivateMessage'
import { UserList } from './decoder/userlist'
import { Damaku } from './decoder/damaku'
import { SwitchRoom } from './decoder/SwitchRoom'
import { Music } from './decoder/Music'
import { paymentCallback } from './decoder/paymentCallback'
import { GetUserListCallback } from './decoder/GetUserListCallback'
import { UserProfileCallback } from './decoder/UserProfileCallback'
import { BankCallback } from './decoder/BankCallback'
import { MediaListCallback } from './decoder/MediaListCallback'
import { SelfMove } from './decoder/SelfMove'
import { Payment, Like, Follower, RoomNotice } from './decoder/MailboxMessage'

interface WebSocketEvent {
  on(event: 'send', listener: (msg: string) => void): void;
  on(event: 'message', listener: (msg: string) => void): void;
  on(event: 'connect', listener: () => void): void;
  on(event: 'disconnect', listener: () => void): void;

  once(event: 'send', listener: (msg: string) => void): void;
  once(event: 'message', listener: (msg: string) => void): void;
  once(event: 'connect', listener: () => void): void;
  once(event: 'disconnect', listener: () => void): void;

  emit(event: 'send', msg: string): void;
  emit(event: 'message', msg: string): void;
  emit(event: 'connect'): void;
  emit(event: 'disconnect'): void;

  removeAllListeners(event: 'send'): void
  removeAllListeners(event: 'message'): void
  removeAllListeners(event: 'connect'): void
  removeAllListeners(event: 'disconnect'): void
}

interface BotEvent {
  on(event: 'login', listener: () => void): void;
  on(event: 'UserList', listener: (msg: UserList[]) => void): void;
  on(event: 'PublicMessage', listener: (msg: PublicMessage) => void): void;
  on(event: 'PrivateMessage', listener: (msg: PrivateMessage) => void): void;
  on(event: 'LeaveRoom', listener: (msg: SystemMessage) => void): void;
  on(event: 'JoinRoom', listener: (msg: SystemMessage) => void): void;
  on(event: 'damaku', listener: (msg: Damaku) => void): void;
  on(event: 'like', listener: (msg: Like) => void): void;
  on(event: 'SwitchRoom', listener: (msg: SwitchRoom) => void): void;
  on(event: 'music', listener: (msg: Music) => void): void;
  on(event: 'paymentCallback', listener: (msg: paymentCallback) => void): void;
  on(event: 'GetUserListCallback', listener: (msg: GetUserListCallback[]) => void): void;
  on(event: 'UserProfileCallback', listener: (msg: UserProfileCallback) => void): void;
  on(event: 'BankCallback', listener: (msg: BankCallback) => void): void;
  on(event: 'MediaListCallback', listener: (msg: MediaListCallback[]) => void): void;
  on(event: 'SelfMove', listener: (msg: SelfMove) => void): void;
  on(event: 'payment', listener: (msg: Payment) => void): void;
  on(event: 'roomNotice', listener: (msg: RoomNotice) => void): void;
  on(event: 'follower', listener: (msg: Follower) => void): void;

  once(event: 'login', listener: () => void): void;
  once(event: 'UserList', listener: (msg: UserList[]) => void): void;
  once(event: 'PublicMessage', listener: (msg: PublicMessage) => void): void;
  once(event: 'PrivateMessage', listener: (msg: PrivateMessage) => void): void;
  once(event: 'LeaveRoom', listener: (msg: SystemMessage) => void): void;
  once(event: 'JoinRoom', listener: (msg: SystemMessage) => void): void;
  once(event: 'damaku', listener: (msg: Damaku) => void): void;
  once(event: 'like', listener: (msg: Like) => void): void;
  once(event: 'SwitchRoom', listener: (msg: SwitchRoom) => void): void;
  once(event: 'music', listener: (msg: Music) => void): void;
  once(event: 'paymentCallback', listener: (msg: paymentCallback) => void): void;
  once(event: 'GetUserListCallback', listener: (msg: GetUserListCallback[]) => void): void;
  once(event: 'UserProfileCallback', listener: (msg: UserProfileCallback) => void): void;
  once(event: 'BankCallback', listener: (msg: BankCallback) => void): void;
  once(event: 'MediaListCallback', listener: (msg: MediaListCallback[]) => void): void;
  once(event: 'SelfMove', listener: (msg: SelfMove) => void): void;
  once(event: 'payment', listener: (msg: Payment) => void): void;
  once(event: 'roomNotice', listener: (msg: RoomNotice) => void): void;
  once(event: 'follower', listener: (msg: Follower) => void): void;

  emit(event: 'login'): void;
  emit(event: 'UserList', msg: UserList[]): void;
  emit(event: 'PublicMessage', msg: PublicMessage): void;
  emit(event: 'PrivateMessage', msg: PrivateMessage): void;
  emit(event: 'LeaveRoom', msg: SystemMessage): void;
  emit(event: 'JoinRoom', msg: SystemMessage): void;
  emit(event: 'damaku', msg: Damaku): void;
  emit(event: 'like', msg: Like): void;
  emit(event: 'SwitchRoom', msg: SwitchRoom): void;
  emit(event: 'music', msg: Music): void;
  emit(event: 'paymentCallback', msg: paymentCallback): void;
  emit(event: 'GetUserListCallback', msg: GetUserListCallback[]): void;
  emit(event: 'UserProfileCallback', msg: UserProfileCallback): void;
  emit(event: 'BankCallback', msg: BankCallback): void;
  emit(event: 'MediaListCallback', msg: MediaListCallback[]): void;
  emit(event: 'SelfMove', msg: SelfMove): void;
  emit(event: 'payment', msg: Payment): void;
  emit(event: 'roomNotice', msg: RoomNotice): void;
  emit(event: 'follower', msg: Follower): void;

  removeAllListeners(event: 'login'): void
  removeAllListeners(event: 'UserList'): void
  removeAllListeners(event: 'PublicMessage'): void
  removeAllListeners(event: 'PrivateMessage'): void
  removeAllListeners(event: 'LeaveRoom'): void
  removeAllListeners(event: 'JoinRoom'): void
  removeAllListeners(event: 'damaku'): void
  removeAllListeners(event: 'like'): void
  removeAllListeners(event: 'SwitchRoom'): void
  removeAllListeners(event: 'music'): void
  removeAllListeners(event: 'paymentCallback'): void
  removeAllListeners(event: 'GetUserListCallback'): void
  removeAllListeners(event: 'UserProfileCallback'): void
  removeAllListeners(event: 'BankCallback'): void
  removeAllListeners(event: 'MediaListCallback'): void
  removeAllListeners(event: 'SelfMove'): void
  removeAllListeners(event: 'payment'): void
  removeAllListeners(event: 'roomNotice'): void
  removeAllListeners(event: 'follower'): void
}

export const WebSocket: WebSocketEvent = new EventEmitter()
export const Bot: BotEvent = new EventEmitter()

// @ts-ignore
Bot.setMaxListeners(Number.MAX_SAFE_INTEGER)
