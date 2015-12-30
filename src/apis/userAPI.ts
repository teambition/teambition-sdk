'use strict'
import {tbFetch} from '../utils/fetch'
import {userModel} from '../models'
import {IUserMe} from 'teambition'

export const UserAPI = {
  getUserMe() {
    const cache = userModel.get()
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
        return userModel.set(userMe)
      })
    }
  },

  update(patch: any) {
    return tbFetch.put({
      Type: 'users',
      Id: 'me'
    }, patch)
    .then((userMe: IUserMe) => {
      userModel.update(userMe)
    })
  }
}
