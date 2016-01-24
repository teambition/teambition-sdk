'use strict'
import {tbFetch} from '../utils/fetch'
import UserModel from '../models/user_model'
import {IUserMe, IUserEmail} from 'teambition'

export const UserAPI = {
  getUserMe(): Promise<IUserMe> {
    const cache = UserModel.get()
    if (cache) {
      return new Promise((resolve, reject) => {
        resolve(cache)
      })
    }else {
      return tbFetch.get({
        Type: 'users',
        Id: 'me'
      })
      .then((userMe: IUserMe) => {
        return UserModel.set(userMe)
      })
    }
  },

  update<T extends {
    _id: string
  }>(patch: any): Promise<T> {
    return tbFetch.put({
      Type: 'users',
      Id: 'me'
    }, patch)
    .then((userMe: any) => {
      UserModel.update(userMe)
      return userMe
    })
  },

  addEmail(email: string): Promise<IUserEmail[]> {
    return tbFetch.post({
      Type: 'users',
      Id: 'email'
    }, {
      email: email
    }).then((data: IUserEmail[]) => {
      UserModel.updateEmail(data)
      return data
    })
  },

  bindPhone(phone: string, vcode: string): Promise<void> {
    return tbFetch.put({
      Type: 'users',
      Id: 'phone'
    }, {
      phone: phone,
      vcode: vcode
    }).then((data: any) => {
      UserModel.update({
        phone: phone
      })
    })
  }
}
