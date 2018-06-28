import { UserId } from 'teambition-types'
import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemaColl } from './schemas'

export interface UserEmail {
  email: string
  state: number
  _id: string
  id: string
}

export interface UserPaymentPlan {
  _objectId: UserId
  expired: string | null
  isExpired: boolean
  membersCount: number
  objectType: 'user'
  paidCount: number
  status: string
}

export type StrikerToken = string & { kind: 'StrikerToken' }

export type TcmToken = string & { kind: 'TcmToken' }

export interface UserMe {
  _id: UserId
  email: string
  name: string
  avatarUrl: string
  language: string
  created: string
  crossNotify: {
    badge: number
  }
  title: string
  birthday?: string
  location?: string
  phone: string
  isActive?: boolean
  isGhost?: boolean
  isRobot?: boolean
  website?: string
  pinyin: string
  py: string
  isNew?: boolean
  plan: UserPaymentPlan
  notification?: {
    comment: {
      mobile: boolean
      email: boolean
    },
    newpost: {
      mobile: boolean
      email: boolean
    },
    newtask: {
      mobile: boolean
      email: boolean
    },
    newwork: {
      mobile: boolean
      email: boolean
    },
    newevent: {
      mobile: boolean
      email: boolean
    },
    involve: {
      mobile: boolean
      email: boolean
    },
    update: {
      mobile: boolean
      email: boolean
    },
    daily: {
      mobile: boolean
      email: boolean
    },
    monthly: {
      mobile: boolean
      email: boolean
    }
  }
  lastEntered: {
    web?: string
    ios?: string
    android?: string
    third: string
  }
  locationByIP: {
    country: string
    region: string
    city: string
  }
  aliens?: any[]
  strikerAuth: StrikerToken
  phoneForLogin?: string
  enabledGoogleTwoFactor?: boolean
  emails: UserEmail[]
  tcmToken: TcmToken
  badge: number
  normal?: number
  ated: number
  later: number
  private?: number
  inbox: number
  hasNormal?: boolean
  hasAted?: boolean
  hasLater?: boolean
  hasPrivate?: boolean
  calLink?: string
  taskCalLink?: string
  joinedProjectsCount: number
  region: string
}

const Schema: SchemaDef<UserMe> = {
  _id: {
    type: RDBType.STRING,
    primaryKey: true
  },
  avatarUrl: {
    type: RDBType.STRING
  },
  ated: {
    type: RDBType.NUMBER
  },
  aliens: {
    type: RDBType.OBJECT
  },
  badge: {
    type: RDBType.NUMBER
  },
  birthday: {
    type: RDBType.DATE_TIME
  },
  calLink: {
    type: RDBType.STRING
  },
  created: {
    type: RDBType.DATE_TIME
  },
  crossNotify: {
    type: RDBType.OBJECT
  },
  email: {
    type: RDBType.STRING
  },
  emails: {
    type: RDBType.OBJECT
  },
  enabledGoogleTwoFactor: {
    type: RDBType.BOOLEAN
  },
  hasAted: {
    type: RDBType.BOOLEAN
  },
  hasLater: {
    type: RDBType.BOOLEAN
  },
  hasNormal: {
    type: RDBType.BOOLEAN
  },
  hasPrivate: {
    type: RDBType.BOOLEAN
  },
  inbox: {
    type: RDBType.NUMBER
  },
  isActive: {
    type: RDBType.BOOLEAN
  },
  isGhost: {
    type: RDBType.BOOLEAN
  },
  isNew: {
    type: RDBType.BOOLEAN
  },
  isRobot: {
    type: RDBType.BOOLEAN
  },
  joinedProjectsCount: {
    type: RDBType.NUMBER
  },
  language: {
    type: RDBType.STRING
  },
  lastEntered: {
    type: RDBType.DATE_TIME
  },
  later: {
    type: RDBType.NUMBER
  },
  location: {
    type: RDBType.STRING
  },
  locationByIP: {
    type: RDBType.OBJECT
  },
  name: {
    type: RDBType.STRING
  },
  normal: {
    type: RDBType.NUMBER
  },
  notification: {
    type: RDBType.OBJECT
  },
  phone: {
    type: RDBType.STRING
  },
  phoneForLogin: {
    type: RDBType.STRING
  },
  pinyin: {
    type: RDBType.STRING
  },
  plan: {
    type: RDBType.OBJECT
  },
  private: {
    type: RDBType.NUMBER
  },
  py: {
    type: RDBType.STRING
  },
  region: {
    type: RDBType.STRING
  },
  tcmToken: {
    type: RDBType.STRING
  },
  strikerAuth: {
    type: RDBType.STRING
  },
  taskCalLink: {
    type: RDBType.STRING
  },
  title: {
    type: RDBType.STRING
  },
  website: {
    type: RDBType.STRING
  }
}

export default schemaColl.add({ schema: Schema, name: 'User' })
