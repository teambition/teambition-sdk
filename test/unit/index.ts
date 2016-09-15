'use strict'
import BaseFetch from '../../src/fetchs/BaseFetch'

export const apihost = BaseFetch.fetch.getAPIHost()

if (process.env.running_under_istanbul) {
  global.timeout1 = 60
  global.timeout2 = 120
  global.timeout3 = 180
  global.timeout4 = 240
}else {
  global.timeout1 = 30
  global.timeout2 = 60
  global.timeout3 = 90
  global.timeout4 = 120
}

export * from '../../src/app'
export * from '../../src/utils/index'
export { default as BaseFetch } from '../../src/fetchs/BaseFetch'
export { Backend, SocketMock } from '../../mock/index'
export * from './app'
