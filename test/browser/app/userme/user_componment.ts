'use strict'
import {componments} from '../componment'
import {UserAPI} from '../tbsdk'
import {ChangeTitle} from './change_title'
import {IUserMe} from 'teambition'

const navigation = require('./layout.html')

@componments({
  template: navigation,
  selector: 'root-componment',
  injectable: [UserAPI],
  childNodes: [ChangeTitle]
})
export class UserComponment {

  userMe: IUserMe = <any>{}

  constructor(private user: UserAPI) {}

  onInit() {
    return this.user.getUserMe().then((userMe) => {
      this.userMe = userMe
    })
  }
}
