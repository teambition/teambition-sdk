'use strict'
import BaseAPI from './base_api'
import UserModel from '../models/user_model'
import {IUserMe, IUserEmail} from 'teambition'

export class User extends BaseAPI {

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

  update<T extends {
    _id: string
  }>(patch: any): Promise<T> {
    return this.tbFetch.put({
      Type: 'users',
      Id: 'me'
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

export const UserAPI = new User()
