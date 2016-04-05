'use strict'
import BaseFetch from './base'
import {UserMe, UserEmail} from '../teambition'

export class UserFetch extends BaseFetch {

  getUserMe(): Promise<UserMe> {
    return this.tbFetch.get(`/users/me`)
  }

  update(patch: any): Promise<any> {
    return this.tbFetch.put('/users', patch)
  }

  addEmail(email: string): Promise<UserEmail[]> {
    return this.tbFetch.post('/users/email', {
      email: email
    })
  }

  bindPhone(phone: string, vcode: string): Promise<void> {
    return this.tbFetch.put('/users/phone', {
      phone: phone,
      vcode: vcode
    })
  }
}

export default new UserFetch()
