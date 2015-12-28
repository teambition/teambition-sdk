import {UserAPI, tbFetch} from '../src/app'
import token from './token'
import {mock} from './mock'
import {IUserMe} from 'teambition'
mock(tbFetch)
tbFetch.setToken(token)

let _userMe: IUserMe

mock(UserAPI)

UserAPI.getUserMe().then((userMe: IUserMe) => {
  _userMe = userMe
})
.then(() => {
  return UserAPI.update({
    name: '龙逸楠'
  })
})
.then((data: any) => {
  console.log(_userMe['$id'], _userMe.name)
})
