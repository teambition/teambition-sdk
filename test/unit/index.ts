'use strict'
import { Fetch } from '../../src/app'

export const apihost = Fetch.getAPIHost()

if (process.env.running_under_istanbul) {
  global.timeout1 = 1000
  global.timeout2 = 2500
  global.timeout3 = 5000
  global.timeout4 = 7500
}else {
  global.timeout1 = 15
  global.timeout2 = 30
  global.timeout3 = 50
  global.timeout4 = 100
}

export * from '../../src/app'
export * from '../../src/utils/index'
export { default as BaseAPI } from '../../src/fetchs/base'
export { Backend } from '../../mock/index'
export * from './app'
