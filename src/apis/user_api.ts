'use strict'
import BaseAPI from './base_api'
import UserModel from '../models/user_model'
import {UserMe, UserEmail} from '../teambition'

export class UserAPI extends BaseAPI {

  public static UserModel = new UserModel()

  getUserMe(): Promise<UserMe> {
    return UserAPI.UserModel.get()
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return this.tbFetch.get({
        Type: 'users',
        Id: 'me'
      })
      .then((userMe: UserMe) => {
        return UserAPI.UserModel.set(userMe)
      })
    })
  }

  update(patch: any): Promise<any> {
    if (!patch || !patch.name) {
      return Promise.reject('User name is required')
    }
    return this.tbFetch.put({
      Type: 'users'
    }, patch)
    .then((userMe: any) => {
      return UserAPI.UserModel.update(userMe)
    })
  }

  addEmail(email: string): Promise<void> {
    return this.tbFetch.post({
      Type: 'users',
      Id: 'email'
    }, {
      email: email
    }).then((data: UserEmail[]) => {
      return UserAPI.UserModel.updateEmail(data)
    })
  }

  bindPhone(phone: string, vcode: string): Promise<void> {
    return this.tbFetch.put({
      Type: 'users',
      Id: 'phone'
    }, {
      phone: phone,
      vcode: vcode
    }).then((data: any) => {
      return UserAPI.UserModel.update({
        phone: phone
      })
    })
  }
}
