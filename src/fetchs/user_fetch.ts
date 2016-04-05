'use strict'
import BaseFetch from './base'
import {UserMe, UserEmail} from '../teambition'

export class UserFetch extends BaseFetch {

  getUserMe(): Promise<UserMe> {
    return this.tbFetch.get({
      Type: 'users',
      Id: 'me'
    })
  }

  update(patch: any): Promise<any> {
    return this.tbFetch.put({
      Type: 'users'
    }, patch)
  }

  addEmail(email: string): Promise<UserEmail[]> {
    return this.tbFetch.post({
      Type: 'users',
      Id: 'email'
    }, {
      email: email
    })
  }

  bindPhone(phone: string, vcode: string): Promise<void> {
    return this.tbFetch.put({
      Type: 'users',
      Id: 'phone'
    }, {
      phone: phone,
      vcode: vcode
    })
  }
}

export default new UserFetch()
