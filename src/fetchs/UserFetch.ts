'use strict'
import BaseFetch from './base'
import { UserMe, UserEmail } from '../teambition'

export class UserFetch extends BaseFetch {

  getUserMe(): Promise<UserMe> {
    return this.fetch.get(`users/me`)
  }

  update(patch: any): Promise<any> {
    return this.fetch.put('users', patch)
  }

  addEmail(email: string): Promise<UserEmail[]> {
    return this.fetch.post('users/email', {
      email: email
    })
  }

  bindPhone(phone: string, vcode: string): Promise<void> {
    return this.fetch.put<void>('users/phone', {
      phone: phone,
      vcode: vcode
    })
  }
}
