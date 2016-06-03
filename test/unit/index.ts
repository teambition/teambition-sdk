'use strict'
import BaseFetch from '../../src/fetchs/BaseFetch'

export const apihost = BaseFetch.fetch.getAPIHost()

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
export { default as BaseFetch } from '../../src/fetchs/BaseFetch'
export { Backend } from '../../mock/index'
export * from './app'
