'use strict'
import {mockToken} from './mock/token'
import {Fetch} from '../../src/utils/fetch'

Fetch.setToken(mockToken)

export {Backend} from '../../mock'
export * from '../../src/app'
export * from '../../src/utils'
export * from '../../src/utils/track'
export * from './app'
