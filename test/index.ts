'use strict'
import {mockToken} from './mock'
import {tbFetch} from '../src/utils/fetch'

tbFetch.setToken(mockToken)

export {Backend} from '../mock'
export * from '../src/app'
export * from '../src/utils'
export * from '../src/utils/track'
export * from './app'
