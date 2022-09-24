import decodeDamaku from './decoder/damaku'
import decodeJoinRoom from './decoder/JoinRoom'
import decodeLeaveRoom from './decoder/LeaveRoom'
import decodeMoveToRoom from './decoder/SwitchRoom'
import decodeMusic from './decoder/Music'
import decodePaymentCallback from './decoder/paymentCallback'
import decodePrivateMessage from './decoder/PrivateMessage'
import decodePublicMessage from './decoder/PublicMessage'
import decodeUserlist from './decoder/userlist'
import decodeGetUserListCallback from './decoder/GetUserListCallback'
import decodeUserProfileCallback from './decoder/UserProfileCallback'
import decodeBankCallback from './decoder/BankCallback'
import decodeMediaListCallback from './decoder/MediaListCallback'
import decodeSelfMove from './decoder/SelfMove'
import decodeMailboxMessage from './decoder/MailboxMessage'

// 媒体API
import encodeAdminMediaClear from './encoder/admin/media/clear'
import encodeAdminMediaCut from './encoder/admin/media/cut'
import encodeAdminMediaExchange from './encoder/admin/media/exchange'
import encodeAdminMediaGoto from './encoder/admin/media/goto'
import encodeAdminMediaOperation from './encoder/admin/media/operation'

// 管理员API
import encodeAdminBlacklist from './encoder/admin/blacklist'
import encodeAdminKick from './encoder/admin/kick'
import encodeAdminMute from './encoder/admin/mute'
import encodeAdminNotice from './encoder/admin/notice'
import encodeAdminSetMaxUser from './encoder/admin/setMaxUser'
import encodeAdminWhitelist from './encoder/admin/whitelist'

// 消息API
import encodeMessageDamaku from './encoder/messages/damaku'
import encodeMessageMediaCard from './encoder/messages/MediaCard'
import encodeMessageMediaData from './encoder/messages/MediaData'
import encodeMessagePrivateMessage from './encoder/messages/PrivateMessage'
import encodeMessagePublicMessage from './encoder/messages/PublicMessage'

// 系统API
import encodeSystemBank from './encoder/system/bank'
import encodeSystemGetUserList from './encoder/system/GetUserList'
import encodeSystemLike from './encoder/system/like'
import encodeSystemLogin from './encoder/system/login'
import encodeSystemMediaList from './encoder/system/MediaList'
import encodeSystemPayment from './encoder/system/payment'

// 用户API
import encodeUserProfile from './encoder/user/UserProfile'

export class Encoder {
  public admin: {
    media: {
      clear: typeof encodeAdminMediaClear,
      cut: typeof encodeAdminMediaCut,
      exchange: typeof encodeAdminMediaExchange,
      goto: typeof encodeAdminMediaGoto,
      operation: typeof encodeAdminMediaOperation
    },
    blacklist: typeof encodeAdminBlacklist,
    kick: typeof encodeAdminKick,
    mute: typeof encodeAdminMute,
    notice: typeof encodeAdminNotice,
    setMaxUser: typeof encodeAdminSetMaxUser,
    whitelist: typeof encodeAdminWhitelist
  }

  public messages: {
    damaku: typeof encodeMessageDamaku,
    mediaCard: typeof encodeMessageMediaCard,
    mediaData: typeof encodeMessageMediaData,
    privateMessage: typeof encodeMessagePrivateMessage,
    publicMessage: typeof encodeMessagePublicMessage
  }

  public system: {
    bank: typeof encodeSystemBank,
    getUserList: typeof encodeSystemGetUserList,
    like: typeof encodeSystemLike,
    login: typeof encodeSystemLogin,
    mediaList: typeof encodeSystemMediaList,
    payment: typeof encodeSystemPayment
  }

  public user: {
    userProfile: typeof encodeUserProfile
  }

  constructor() {
    this.admin = {
      media: {
        clear: encodeAdminMediaClear,
        cut: encodeAdminMediaCut,
        exchange: encodeAdminMediaExchange,
        goto: encodeAdminMediaGoto,
        operation: encodeAdminMediaOperation
      },
      blacklist: encodeAdminBlacklist,
      kick: encodeAdminKick,
      mute: encodeAdminMute,
      notice: encodeAdminNotice,
      setMaxUser: encodeAdminSetMaxUser,
      whitelist: encodeAdminWhitelist
    }

    this.messages = {
      damaku: encodeMessageDamaku,
      mediaCard: encodeMessageMediaCard,
      mediaData: encodeMessageMediaData,
      privateMessage: encodeMessagePrivateMessage,
      publicMessage: encodeMessagePublicMessage
    }

    this.system = {
      bank: encodeSystemBank,
      getUserList: encodeSystemGetUserList,
      like: encodeSystemLike,
      login: encodeSystemLogin,
      mediaList: encodeSystemMediaList,
      payment: encodeSystemPayment
    }

    this.user = {
      userProfile: encodeUserProfile
    }
  }
}

export class Decoder {
  private decoder: ((...args: any) => [string, any][] | undefined)[]

  constructor() {
    this.decoder = [
      decodeDamaku,
      decodeJoinRoom,
      decodeLeaveRoom,
      decodeMoveToRoom,
      decodeMusic,
      decodePaymentCallback,
      decodePrivateMessage,
      decodePublicMessage,
      decodeUserlist,
      decodeGetUserListCallback,
      decodeUserProfileCallback,
      decodeBankCallback,
      decodeMediaListCallback,
      decodeSelfMove,
      decodeMailboxMessage
    ]
  }

  autoDecoder(packet: string) {
    for (const decoder of this.decoder) {
      const result = decoder(packet)
      if (result instanceof Array && result.length > 0) return result
    }

    return false
  }
}