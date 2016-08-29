'use strict'
import BaseFetch from '../../src/fetchs/BaseFetch'

export const apihost = BaseFetch.fetch.getAPIHost()

if (process.env.running_under_istanbul) {
  global.timeout1 = 200
  global.timeout2 = 300
  global.timeout3 = 400
  global.timeout4 = 500
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
