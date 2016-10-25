'use strict'
import { ISchema, Schema, schemaName } from './schema'
import { UserId } from '../teambition'

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
  kind: 'StrikerToken'
}

export interface SnapperToken extends String {
  kind: 'SnapperToken'
}

export interface UserMe extends ISchema {
  _id: UserId
  email: string
  name: string
  avatarUrl: string
  created: string
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
}

@schemaName('UserMe')
export default class User extends Schema<UserMe> implements UserMe {
  _id: UserId = undefined
  email: string = undefined
  name: string = undefined
  avatarUrl: string = undefined
  created: string = undefined
  title: string = undefined
  phone: string = undefined
  pinyin: string = undefined
  py: string = undefined
  plan: PaymentPlan = undefined
  lastEntered: {
    web?: string
    ios?: string
    android?: string
    third: string
  } = undefined
  locationByIP: {
    country: string
    region: string
    city: string
  } = undefined
  strikerAuth: StrikerToken = undefined
  emails: UserEmail[] = undefined
  snapperToken: SnapperToken = undefined
  badge: number = undefined
  ated: number = undefined
  later: number = undefined
  inbox: number = undefined
  joinedProjectsCount: number = undefined
}
