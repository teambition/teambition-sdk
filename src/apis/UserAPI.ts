'use strict'
import {Observable} from 'rxjs'
import {UserFetch} from '../fetchs/UserFetch'
import UserModel from '../models/UserModel'
import {UserMe, UserEmail} from '../teambition'

const userFetch = new UserFetch()

export class UserAPI {

  getUserMe(): Observable<UserMe> {
    const get = UserModel.get()
    if (get) return get
    return Observable.fromPromise(userFetch.getUserMe())
      .concatMap(userMe => UserModel.set(userMe))
  }

  update(patch: any): Observable<any> {
    if (!patch || !patch.name) return Observable.throw(new Error('User name is required'))
    return Observable.fromPromise(userFetch.update(patch))
      .concatMap(x => UserModel.update(x))
  }

  addEmail(email: string): Observable<void> {
    return Observable.fromPromise(userFetch.addEmail(email))
      .concatMap(x => UserModel.updateEmail(x))
  }

  bindPhone(phone: string, vcode: string): Observable<void> {
    return Observable.fromPromise(userFetch.bindPhone(phone, vcode))
      .concatMap(x => UserModel.update(x))
  }
}
