'use strict'
import UserFetch from '../fetchs/user_fetch'
import UserModel from '../models/user_model'
import {UserMe, UserEmail} from '../teambition'

export class UserAPI {

  public static UserModel = new UserModel()

  getUserMe(): Promise<UserMe> {
    return UserAPI.UserModel.get()
    .then(cache => {
      if (cache) return Promise.resolve(cache)
      return UserFetch
        .getUserMe()
        .then((userMe: UserMe) => {
          return UserAPI.UserModel.set(userMe)
        })
    })
  }

  update(patch: any): Promise<any> {
    if (!patch || !patch.name) return Promise.reject('User name is required')
    return UserFetch.update(patch)
    .then((userMe: any) => {
      return UserAPI.UserModel.update(userMe)
    })
  }

  addEmail(email: string): Promise<void> {
    return UserFetch.addEmail(email)
      .then((data: UserEmail[]) => {
        return UserAPI.UserModel.updateEmail(data)
      })
  }

  bindPhone(phone: string, vcode: string): Promise<void> {
    return UserFetch
      .bindPhone(phone, vcode)
      .then((data: any) => {
        return UserAPI.UserModel.update({
          phone: phone
        })
      })
  }
}
