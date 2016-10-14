'use strict'
import { Observable } from 'rxjs/Observable'
import UserFetch from '../fetchs/UserFetch'
import UserModel from '../models/UserModel'
import { UserMe } from '../schemas/UserMe'
import { makeColdSignal } from './utils'

export class UserAPI {

  getUserMe(): Observable<UserMe> {
    return makeColdSignal<UserMe>(() => {
      const get = UserModel.get()
      if (get) {
        return get
      }
      return UserFetch.getUserMe()
        .concatMap(userMe => UserModel.set(userMe))
    })
  }

  update(patch: any): Observable<any> {
    return UserFetch.update(patch)
      .concatMap(x => UserModel.update(x))
  }

  addEmail(email: string): Observable<any> {
    return UserFetch.addEmail(email)
      .concatMap(x => UserModel.update({
        emails: x
      }))
  }

  bindPhone(phone: string, vcode: string): Observable<any> {
    return UserFetch.bindPhone(phone, vcode)
      .concatMap(x => UserModel.update(x))
  }
}

export default new UserAPI
