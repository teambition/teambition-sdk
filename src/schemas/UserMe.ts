'use strict'
import { UserEmail } from '../teambition'
import { ISchema, Schema, schemaName } from './schema'

export interface UserMe extends ISchema<UserMe> {
  _id: string
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
  locationByIP: {
    country: string
    region: string
    city: string
  }
  aliens?: any[]
  strikerAuth: string
  phoneForLogin?: string
  enabledGoogleTwoFactor?: boolean
  emails: UserEmail[]
  snapperToken: string
  hasNew: boolean
  badge: number
  inbox: number
  normal?: number
  ated: number
  later: number
  private?: number
  hasNormal?: boolean
  hasAted?: boolean
  hasLater?: boolean
  hasPrivate?: boolean
  calLink?: string
  taskCalLink?: string
  joinedProjectsCount: number
}

@schemaName('UserMe')
export default class User extends Schema implements UserMe {
  _id: string = undefined
  email: string = undefined
  name: string = undefined
  avatarUrl: string = undefined
  created: string = undefined
  title: string = undefined
  location: string = undefined
  phone: string = undefined
  isActive: boolean = undefined
  pinyin: string = undefined
  py: string = undefined
  isNew: boolean = undefined
  locationByIP: {
    country: string
    region: string
    city: string
  } = undefined
  strikerAuth: string = undefined
  emails: UserEmail[] = undefined
  snapperToken: string = undefined
  hasNew: boolean = undefined
  badge: number = undefined
  inbox: number = undefined
  ated: number = undefined
  later: number = undefined
  calLink: string = undefined
  taskCalLink: string = undefined
  joinedProjectsCount: number = undefined
}
