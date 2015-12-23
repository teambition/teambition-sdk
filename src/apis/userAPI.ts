'use strict'
import {tbFetch} from '../fetch'

export const UserAPI = {
  getUserMe() {
    return tbFetch.get({
      Type: 'users',
      Id: 'me'
    })
  }
}
