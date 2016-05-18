'use strict'
import {mockToken} from './mock/token'
import {Fetch} from '../../src/utils/fetch'

Fetch.setToken(mockToken)

export const apihost = Fetch.getAPIHost()

export * from '../../src/app'
export * from '../../src/utils'
export {Backend} from '../../mock'
export * from './app'
