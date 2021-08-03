import AlphaWolf from './Role/AlphaWolf'
import AppS from './Role/AppS'
import Fire from './Role/Fire'
import Fool from './Role/Fool'
import Hunter from './Role/Hunter'
import Mage from './Role/Mage'
import Seer from './Role/Seer'
import Tanner from './Role/Tanner'
import Thief from './Role/Thief'
import VG from './Role/VG'
import WW from './Role/WW'

export const RoleList: {
  [index: string]: {
    name: string,
    type: string,
    intro: string
  }
} = {
  VG: {
    name: '普通村民',
    type: 'Human',
    intro: '普通村民: 你似乎没有任何特殊能力。'
  },
  WW: {
    name: '🐺狼人',
    type: 'Wolf',
    intro: '🐺狼人: 每晚你都可以大开杀戒！'
  },
  Seer: {
    name: '👳先知',
    type: 'Human',
    intro: '👳先知: 每夜你就可以选择预知其中一个玩家的身份。除非你希望被狼人杀掉，不要暴露你的身份！'
  },
  Mage: {
    name: '🧙‍♀️女巫',
    type: 'Human',
    intro: '🧙‍♀️女巫:每天晚上你都可以选择杀死一个人，也可以选择是否拯救一个人'
  },
  Fool: {
    name: '🤓冒牌先知',
    type: 'Human',
    intro: '🤓冒牌先知:经常把事情搞错，但以为自己就是先知，因此你去查人的身份时，经常查成另一个人的身份，而自己还以为是对的。'
  },
  Fire: {
    name: '🔥纵火犯',
    type: 'Fire',
    intro: '🔥纵火犯: 你孤身一人。你每天晚上都可以对别人家的房子浇汽油并放一把火。'
  },
  Thief: {
    name: '👻小偷',
    type: 'Human',
    intro: '👻小偷: 每晚可以偷取某人能力，有50%几率成功，如果成功，则 被偷取能力的玩家 将变成👻小偷。（其实就是交换能力）'
  },
  AppS: {
    name: '👳先知学徒',
    type: 'Human',
    intro: '👳先知学徒: 当你的老师回到主的身边，你就会成为👳先知引领人类继续斗争。不过在这之前你还是个学徒（普通村民）。'
  },
  AlphaWolf: {
    name: '🐺头狼',
    type: 'Wolf',
    intro: '🐺头狼: 🐺狼人之源。只要你活着，被你咬过的，有20%的几率变成🐺狼人。'
  },
  Hunter: {
    name: '🎯猎人',
    type: 'Human',
    intro: '🎯猎人: 手上没枪你就睡不踏实。如果你死了，你可以选择一名玩家和你陪葬。如果你被🐺狼人咬了，那你有机会把这个狼人杀死，但却不能再选择杀死其他人。如果🐺狼人来杀你，你有机会杀死他；你死前可以杀死一人跟你陪葬。'
  },
  Tanner: {
    name: '👺圣战者',
    type: 'Tanner',
    intro: '👺圣战者:你痛恨那帮愚蠢的非信徒，你想干掉他们，他们却不靠近你。好在，你有一个机会，只要你被大家全民公审，你就可以带着炸弹去杀死那些非信徒，达成主的嘱托。'
  }
}

export const Role = {
  Fire: Fire,
  Fool: Fool,
  Mage: Mage,
  Seer: Seer,
  Thief: Thief,
  VG: VG,
  WW: WW,
  AppS: AppS,
  AlphaWolf: AlphaWolf,
  Hunter: Hunter,
  Tanner: Tanner
}
