'use strict'
import token from './mock/token'
import {tbFetch} from '../src/utils/fetch'

tbFetch.setToken(token)

export {Backend} from '../mock'
export {UserAPI} from '../src/app'
export * from '../src/utils'
export * from '../src/utils/track'
export * from './app'
