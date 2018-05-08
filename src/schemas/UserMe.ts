'use strict'
import { ISchema, Schema, schemaName } from './schema'
import { UserId } from '../teambition'

export interface UserEmail {
  email: string
  state: number
  _id: string
  id: string
}

export interface UserPaymentPlan {
  _objectId: UserId
  days: number
  expired: string | null
  isExpired: boolean
  isTrialExpired: boolean
  membersCount: number
  objectType: 'user'
  paidCount: number
  payType: string
  status: string
  trialExpired: string | null
  trialType: string
}

export interface StrikerToken extends String {
  kind?: 'StrikerToken'
}

export interface SnapperToken extends String {
  kind?: 'SnapperToken'
}

export interface TcmToken extends String {
  kind?: 'TcmToken'
}

export interface UserMe extends ISchema {
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
  notification?: Record<
  | 'comment'
  | 'newpost'
  | 'newtask'
  | 'newwork'
  | 'newevent'
  | 'involve'
  | 'update'
  | 'daily'
  | 'monthly'
  , Record<'mobile' | 'email', boolean>>
  lastEntered: Partial<Record<
  | 'web'
  | 'ios'
  | 'android'
  | 'third'
  , string>>
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

@schemaName('UserMe')
export default class User extends Schema<UserMe> implements UserMe {
  _id: UserId = undefined
  email: string = undefined
  name: string = undefined
  avatarUrl: string = undefined
  language: string = undefined
  created: string = undefined
  crossNotify: UserMe['crossNotify'] = undefined
  title: string = undefined
  birthday?: string = undefined
  location?: string = undefined
  phone: string = undefined
  isActive?: boolean = undefined
  isGhost?: boolean = undefined
  isRobot?: boolean = undefined
  website?: string = undefined
  pinyin: string = undefined
  py: string = undefined
  isNew?: boolean = undefined
  plan: UserPaymentPlan = undefined
  notification?: UserMe['notification'] = undefined
  lastEntered: UserMe['lastEntered'] = undefined
  locationByIP: UserMe['locationByIP'] = undefined
  aliens?: any[] = undefined
  strikerAuth: StrikerToken = undefined
  phoneForLogin?: string = undefined
  enabledGoogleTwoFactor?: boolean = undefined
  emails: UserEmail[] = undefined
  snapperToken: SnapperToken = undefined
  tcmToken: TcmToken = undefined
  badge: number = undefined
  normal?: number = undefined
  ated: number = undefined
  later: number = undefined
  private?: number = undefined
  inbox: number = undefined
  hasNormal?: boolean = undefined
  hasAted?: boolean = undefined
  hasLater?: boolean = undefined
  hasPrivate?: boolean = undefined
  calLink?: string = undefined
  taskCalLink?: string = undefined
  joinedProjectsCount: number = undefined
  region: string = undefined
}
