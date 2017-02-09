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

export function clone <T>(a: T): T {
  return JSON.parse(JSON.stringify(a))
}

/**
 * deep equal between a and b
 * loose property compare
 * a: {
 *   foo: 1,
 *   bar: 2
 * }
 * b: {
 *   foo: 1,
 *   bar: 2,
 *   baz: 3
 * }
 * equals(a, b) // pass
 */
export function equals(a: any, b: any) {
  const _a = clone(a)
  const _b = clone(b)
  forEach(_b, (_, key) => {
    if (typeof a[key] === 'undefined') {
      delete _b[key]
    }
  })
  function deleteUndefined(obj: any) {
    forEach(obj, (val, key) => {
      if (typeof val === 'undefined') {
        delete _a[key]
      } else if (val && typeof val === 'object') {
        deleteUndefined(val)
      }
    })
  }
  deleteUndefined(_a)
  expect(_a).to.deep.equal(_b)
}

export function looseDeepEqual(a: any, b: any) {
  forEach(a, (val, key) => {
    if (val && typeof val === 'object') {
      looseDeepEqual(val, b[key])
    } else if (val) {
      expect(val).to.deep.equal(b[key])
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
