'use strict'
import {Observable, Observer} from 'rxjs'
import {UserFetch} from '../fetchs/UserFetch'
import UserModel from '../models/UserModel'
import {UserMe} from '../teambition'

const userFetch = new UserFetch()

export class UserAPI {

  private UserModel: UserModel

  constructor() {
    this.UserModel = new UserModel()
  }

  getUserMe(): Observable<UserMe> {
    const get = this.UserModel.get()
    if (get) return get
    return Observable.fromPromise(userFetch.getUserMe())
      .concatMap(userMe => this.UserModel.set(userMe))
  }

  update(patch: any): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      if (!patch || !patch.name) {
        return observer.error(new Error('User name is required'))
      }
      Observable.fromPromise(userFetch.update(patch))
        .concatMap(x => this.UserModel.update(x))
        .forEach(result => observer.next(result))
    })
  }

  addEmail(email: string): Observable<void> {
    return Observable.fromPromise(userFetch.addEmail(email))
      .concatMap(x => this.UserModel.updateEmail(x))
  }

  bindPhone(phone: string, vcode: string): Observable<void> {
    return Observable.fromPromise(userFetch.bindPhone(phone, vcode))
      .concatMap(x => this.UserModel.update(x))
  }
}
