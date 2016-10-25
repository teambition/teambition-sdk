'use strict'
import { Observable } from 'rxjs/Observable'
import BaseFetch from './BaseFetch'
import { UserMe } from '../schemas/UserMe'

export class UserFetch extends BaseFetch {

  getUserMe(): Observable<UserMe> {
    return this.fetch.get(`users/me`)
  }

  update(patch: any): Observable<any> {
    return this.fetch.put('users', patch)
  }

  addEmail(email: string): Observable<any[]> {
    return this.fetch.post('users/email', {
      email: email
    })
  }

  bindPhone(phone: string, vcode: string): Observable<void> {
    return this.fetch.put<void>('users/phone', {
      phone: phone,
      vcode: vcode
    })
  }
}

export default new UserFetch
