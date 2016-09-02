'use strict'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import UserFetch from '../fetchs/UserFetch'
import UserModel from '../models/UserModel'
import UserMe from '../schemas/UserMe'
import { errorHandler, makeColdSignal, observableError } from './utils'

export class UserAPI {

  constructor() {
    UserModel.destructor()
  }

  getUserMe(): Observable<UserMe> {
    return makeColdSignal<UserMe>(observer => {
      const get = UserModel.get()
      if (get) {
        return get
      }
      return Observable.fromPromise(UserFetch.getUserMe())
        .catch(err => errorHandler(observer, err))
        .concatMap(userMe => UserModel.set(userMe))
    })
  }

  update(patch: any): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      if (!patch || !patch.name) {
        return observer.error(new Error('User name is required'))
      }
      Observable.fromPromise(UserFetch.update(patch))
        .catch(err => errorHandler(observer, err))
        .concatMap(x => UserModel.update(x))
        .forEach(result => observer.next(result))
        .then(() => observer.complete())
    })
  }

  addEmail(email: string): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      Observable.fromPromise(UserFetch.addEmail(email))
        .catch(e => observableError(observer, e))
        .concatMap(x => UserModel.update({
          emails: x
        }))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }

  bindPhone(phone: string, vcode: string): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      Observable.fromPromise(UserFetch.bindPhone(phone, vcode))
        .catch(err => errorHandler(observer, err))
        .concatMap(x => UserModel.update(x))
        .forEach(r => observer.next(r))
        .then(() => observer.complete())
    })
  }
}
