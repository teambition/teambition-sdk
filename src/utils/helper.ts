import { PagingQuery, UrlPagingQuery, SqlPagingQuery } from './internalTypes'
import * as uuidv4 from 'uuid/v4'

export function forEach<T> (target: Array<T>, eachFunc: (val: T, key: number) => void, inverse?: boolean): void

export function forEach<T> (target: Record<string, T>, eachFunc: (val: T, key: string) => void, inverse?: boolean): void

export function forEach (target: any, eachFunc: (val: any, key: any) => void, inverse?: boolean): void

export function forEach (target: any, eachFunc: (val: any, key: any) => any, inverse?: boolean) {
  let length: number
  if (target instanceof Array) {
    length = target.length
    if (!inverse) {
      let i = -1
      while (++i < length) {
        if (eachFunc(target[i], i) === false) {
          break
        }
      }
    } else {
      let i = length
      while (i --) {
        if (eachFunc(target[i], i) === false) {
          break
        }
      }
    }

  } else if (typeof target === 'object') {
    const keys = Object.keys(target)
    let key: string
    length = keys.length
    let i = -1
    while (++i < length) {
      key = keys[i]
      if (eachFunc(target[key], key) === false) {
        break
      }
    }
  }
  return target
}

export const identity = <T>(r: T) => r

export const clone = <T>(origin: T, old?: any): T => {
  old = old || origin
  /* istanbul ignore if */
  if (origin === null) {
    return null as any
  }
  /* istanbul ignore if */
  if (!origin || typeof origin !== 'object') {
    return void 0 as any
  }
  let target: any
  if (origin instanceof Array) {
    target = new Array()
  } else {
    target = { }
  }
  forEach(origin, (val: any, key: string) => {
    if (typeof val === 'object') {
      // null
      if (val && val !== old) {
        target[key] = clone(val, old)
      } else {
        target[key] = val
      }
    } else {
      target[key] = val
    }
  })
  return target
}

export const concat = <T>(target: T[], patch: T[]): T[] => {
  if (!(patch instanceof Array)) {
    return target
  }
  forEach(patch, ele => {
    target.push(ele)
  })
  return target
}

export const uuid = uuidv4

export function dropEle<T>(ele: T, arr: T[]): T[] {
  forEach(arr, (_ele, pos) => {
    const isEqual = ele === _ele
    if (isEqual) {
      arr.splice(pos, 1)
    }
    return !isEqual
  })
  return arr
}

export function capitalizeFirstLetter(str?: string | null) {
  if (!str) {
    return null
  }
  const upper = str[0].toUpperCase()
  if (str[0] === upper) {
    return str
  }
  return upper + str.slice(1)
}

/**
 * refer to https://github.com/github/fetch/blob/v1.0.0/fetch.js#L313
 * XmlHttpRequest's getAllResponseHeaders() method returns a string of response
 * headers according to the format described here:
 * http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
 * This method parses that string into a user-friendly key/value pair object.
 * Now this method also can window.Headers
 */
export function parseHeaders(rawHeader: string) {
    const head = Object.create(null)
    const pairs = rawHeader.trim().split('\n')
    pairs.forEach(header => {
      const split = header.trim().split(':')
      const key = split.shift()!.trim()
      const value = split.join(':').trim()
      head[key] = value
    })
    return head
}

export function headers2Object(headers: Headers): Object {
  const retHeaders = {}
  headers.forEach((val: any, key: any) => retHeaders[key] = val)
  return retHeaders
}

export function pagination(count: number, page: number) {
  return {
    limit: count,
    skip: (count * (page - 1)),
  }
}

const omitKeys = (srcObj: PagingQuery, ...keysToBeOmitted: string[]) => {
  const omitKeySet = new Set(keysToBeOmitted)
  return Object.keys(srcObj)
    .filter((key) => !(omitKeySet.has(key)))
    .reduce((destObj, key) => {
      destObj[key] = srcObj[key]
      return destObj
    }, {})
}

export const normPagingQuery = (
  query: Partial<PagingQuery> = {}
): { forUrl: UrlPagingQuery, forSql: SqlPagingQuery } => {
  const defaultPaging = { count: 500, page: 1 }

  let q: any = { ...defaultPaging, ...query }
  const forUrl = omitKeys(q, 'orderBy') as UrlPagingQuery

  q = { ...q, ...pagination(q.count, q.page) }
  const forSql = omitKeys(q, 'count', 'page') as SqlPagingQuery

  return { forUrl, forSql }
}

export function isEmptyObject(obj: any): boolean {
  if (typeof obj !== 'object') {
    return false
  }
  return Object.keys(obj).length === 0
}

export const hasMorePages = <T>(
  data: T[],
  pageSize: number,
  nextPage: number,
  curr?: {
    page: number,
    hasMore: boolean
  }
): boolean => {

  if (curr && nextPage === curr.page) {
    return curr.hasMore
  }

  return data.length >= pageSize * (nextPage - 1)
}
