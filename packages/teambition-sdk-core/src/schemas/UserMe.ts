import { UserId } from 'teambition-types'
import { SchemaDef, RDBType } from 'reactivedb/interface'
import { schemas } from '../SDK'

export interface UserEmail {
  email: string
  state: number
  _id: string
  id: string
}

export interface PaymentPlan {
  status: 'paid' | 'trial'
  expired: string
  paidCount: number
  membersCount: number
  days: number
  objectType: 'free' | 'organization' | 'professional' | 'user'
}

export interface StrikerToken extends String {
  kind?: 'StrikerToken'
}

export interface SnapperToken extends String {
  kind?: 'SnapperToken'
}

export interface UserMe {
  _id: UserId
  email: string
  name: string
  avatarUrl: string
  created: string
  crossNotify: {
    badge: number
  }
  title: string
  birthday?: string
  location?: string
  phone: string
  isActive?: boolean
  website?: string
  pinyin: string
  py: string
  isNew?: boolean
  plan: PaymentPlan
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
  snapperToken: SnapperToken
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
  isNew: {
    type: RDBType.BOOLEAN
  },
  joinedProjectsCount: {
    type: RDBType.NUMBER
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
  snapperToken: {
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

export default schemas.push({ schema: Schema, name: 'User' })
