'use strict'
import BaseAPI from './base_api'
import UserModel from '../models/user_model'
import {IUserMe, IUserEmail} from 'teambition'

export class UserAPI extends BaseAPI {

  private UserModel = new UserModel()

  getUserMe(): Promise<IUserMe> {
    const cache = this.UserModel.get()
    if (cache) return Promise.resolve(cache)
    return this.tbFetch.get({
      Type: 'users',
      Id: 'me'
    })
    .then((userMe: IUserMe) => {
      return this.UserModel.set(userMe)
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
      this.UserModel.update(userMe)
      return userMe
    })
  }

  addEmail(email: string): Promise<IUserEmail[]> {
    return this.tbFetch.post({
      Type: 'users',
      Id: 'email'
    }, {
      email: email
    }).then((data: IUserEmail[]) => {
      this.UserModel.updateEmail(data)
      return data
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
      this.UserModel.update({
        phone: phone
      })
    })
  }
}
