'use strict'
import BaseFetch from './BaseFetch'
import UserMe from '../schemas/UserMe'

export class UserFetch extends BaseFetch {

  getUserMe(): Promise<UserMe> {
    return this.fetch.get(`users/me`)
  }

  update(patch: any): Promise<any> {
    return this.fetch.put('users', patch)
  }

  addEmail(email: string): Promise<any[]> {
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

export default new UserFetch()
