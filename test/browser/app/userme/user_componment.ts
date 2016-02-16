'use strict'
import {componments} from '../componment'
import {UserAPI} from '../index'
import {IUserMe} from 'teambition'

const navigation = require('./layout.html')

@componments({
  template: navigation,
  selector: 'main-app',
  injectable: [UserAPI]
})
export class UserComponment {

  userMe: IUserMe = <any>{}

  constructor(private user: typeof UserAPI) {}

  onInit() {
    return this.user.getUserMe().then((userMe) => {
      this.userMe = userMe
      console.log(this.userMe)
    })
  }
}
