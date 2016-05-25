'use strict'
import { Observable, Observer } from 'rxjs'
import { UserFetch } from '../fetchs/UserFetch'
import UserModel from '../models/UserModel'
import { UserMe } from '../teambition'

const userFetch = new UserFetch()

export class UserAPI {

  constructor() {
    UserModel.destructor()
  }

  getUserMe(): Observable<UserMe> {
    const get = UserModel.get()
    if (get) {
      return get
    }
    return Observable.fromPromise(userFetch.getUserMe())
      .concatMap(userMe => UserModel.set(userMe))
  }

  update(patch: any): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      if (!patch || !patch.name) {
        return observer.error(new Error('User name is required'))
      }
      Observable.fromPromise(userFetch.update(patch))
        .concatMap(x => UserModel.update(x))
        .forEach(result => observer.next(result))
    })
  }

  addEmail(email: string): Observable<void> {
    return Observable.fromPromise(userFetch.addEmail(email))
      .concatMap(x => UserModel.updateEmail(x))
  }

  bindPhone(phone: string, vcode: string): Observable<any> {
    return Observable.fromPromise(userFetch.bindPhone(phone, vcode))
      .concatMap(x => UserModel.update(x))
  }
}
