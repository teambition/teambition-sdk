import {UserAPI} from '../src/app'

UserAPI.getUserMe().then((userMe: any) => {
  console.log(userMe)
})
