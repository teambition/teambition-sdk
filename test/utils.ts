'use strict'
import { expect } from 'chai'
import { forEach, SDK, capitalizeFirstLetter, SDKFetch } from './index'
import { MockFetch } from './mock/MockFetch'

export function notInclude(collection: any[], ele: any) {
  let result = true
  const unionFlag = ele['_id']
  forEach(collection, val => {
    if (val['_id'] === unionFlag) {
      result = false
    }
  })
  return result
}

export function equals(a: any, b: any) {
  forEach(a, (val, key) => {
    if (val && typeof val === 'object') {
      equals(val, b[key])
    } else {
      expect(val).to.equal(b[key])
    }
  })
}

export function mock<T>(sdk: SDK) {
  const mockFetch = new MockFetch
  const methods = ['get', 'put', 'post', 'delete']

  return (m: T, schedule?: number | Promise<any>) => {
    methods.forEach(method => {
      sdk.fetch[method] = function(url: string, arg2?: any) {
        const mockResult = mockFetch[`mock${capitalizeFirstLetter(method)}`](url, arg2)(sdk.fetch)
        mockResult.mockResponse.respond(m, schedule)
        return mockResult.request
      }
    })
  }
}

export function restore(sdk: SDK) {
  sdk.fetch = new SDKFetch
}
