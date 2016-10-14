'use strict'
import BaseFetch from '../../src/fetchs/BaseFetch'

if (typeof global !== 'undefined') {
  process.on('unhandledRejection', (r: any, p: Promise<any>) => {
    console.log(p)
  })
}

export const apihost = BaseFetch.fetch.getAPIHost()

export * from '../../src/apis/index'
export * from '../../src/app'
export * from '../../src/utils/index'
export { default as BaseFetch } from '../../src/fetchs/BaseFetch'
export * from '../../mock/index'
export * from './app'
