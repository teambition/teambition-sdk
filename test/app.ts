import {UserAPI, tbFetch} from '../src/app'
import token from './token'
import {httpBackend} from '../mock'
import {IUserMe} from 'teambition'

tbFetch.setToken(token)

let _userMe: IUserMe

const apihost = 'https://api.teambition.com'

httpBackend.whenGET(`${apihost}/users/me`).respond({
  _id: '2121121121',
  name: '龙逸楠'
})

httpBackend.whenPUT(`${apihost}/users/me`, {
  name: '龙逸楠'
}).respond({
  _id: '2121121121',
  name: '龙逸楠'
})

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
