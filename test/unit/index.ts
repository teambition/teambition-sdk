'use strict'
import {mockToken} from './mock/token'
import {Fetch} from '../../src/utils/fetch'

export const apihost = Fetch.getAPIHost()

Fetch.setToken(mockToken)

export {Backend} from '../../mock'
export * from '../../src/app'
export * from '../../src/utils'
export * from './app'
