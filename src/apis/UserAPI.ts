'use strict'
import {UserFetch} from '../fetchs/UserFetch'
import UserModel from '../models/UserModel'
import {UserMe, UserEmail} from '../teambition'

const userFetch = new UserFetch()

export class UserAPI {

  public static UserModel = new UserModel()

  getUserMe(): Promise<UserMe> {
    return UserAPI.UserModel.get()
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return userFetch
        .getUserMe()
        .then((userMe: UserMe) => {
          return UserAPI.UserModel.set(userMe)
        })
    })
  }

  update(patch: any): Promise<any> {
    if (!patch || !patch.name) return Promise.reject('User name is required')
    return userFetch.update(patch)
    .then((userMe: any) => {
      return UserAPI.UserModel.update(userMe)
    })
  }

  addEmail(email: string): Promise<void> {
    return userFetch.addEmail(email)
      .then((data: UserEmail[]) => {
        return UserAPI.UserModel.updateEmail(data)
      })
  }

  bindPhone(phone: string, vcode: string): Promise<void> {
    return userFetch
      .bindPhone(phone, vcode)
      .then((data: any) => {
        return UserAPI.UserModel.update({
          phone: phone
        })
      })
  }
}
