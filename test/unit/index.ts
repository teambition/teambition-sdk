'use strict'
import BaseFetch from '../../src/fetchs/BaseFetch'

export const apihost = BaseFetch.fetch.getAPIHost()

export * from '../../src/app'
export * from '../../src/utils/index'
export { default as BaseFetch } from '../../src/fetchs/BaseFetch'
export { Backend, SocketMock } from '../../mock/index'
export * from './app'
