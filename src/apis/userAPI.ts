'use strict'
import {tbFetch} from '../utils/fetch'
import UserModel from '../models/UserModel'
import {IUserMe} from 'teambition'

export const UserAPI = {
  getUserMe() {
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

  update(patch: any) {
    return tbFetch.put({
      Type: 'users',
      Id: 'me'
    }, patch)
    .then((userMe: IUserMe) => {
      UserModel.update(userMe)
    })
  },

  addEmail(email: string) {
    return tbFetch.post({
      Type: 'users',
      Id: 'email'
    }, {
      email: email
    }).then((data: any) => {
      UserModel.update(data)
    })
  },

  bindPhone(phone: string, vcode: string) {
    return tbFetch.put({
      Type: 'users',
      Id: 'phone'
    }, {
      phone: phone,
      vcode: vcode
    }).then((data: any) => {
      UserModel.update(data)
    })
  }
}
