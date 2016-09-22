'use strict'
declare const global: any

export interface FetchResult {
  wait: number | Promise<any>
  response: {
    data: any
    responseInit: ResponseInit
  }
}

export const fetchStack: Map<string, FetchResult[]> = new Map<string, any>()

export const parseObject = (query: any) => {
  let _query: any
  try {
    _query = JSON.parse(query)
  } catch (e) {
    _query = query
  }
  if (typeof _query === 'string') {
    return _query
  }
  if (typeof _query !== 'object') {
    return ''
  }
  return Object.keys(_query)
    .map(key => `${key}=${_query[key]}`)
    .join('&')
}

const context = typeof window !== 'undefined' ? window : global

const originFetch = context['fetch']

export function restore() {
  context['fetch'] = originFetch
}

export function mockFetch() {
  context['fetch'] = (uri: string, options?: {
    method?: any,
    body?: any
  }): any => {
    const method = options.method ? options.method.toLowerCase() : ''
    if (method !== 'options') {
      if (method === 'get') {
        const pos = uri.indexOf('_=')
        if (pos !== -1) {
          uri = uri.substr(0, pos - 1)
        }
      }
      const dataPath = options.body ? parseObject(options.body) : ''
      if (uri.indexOf('?') === -1) {
        uri = options.body ? `${uri}?${dataPath}` : uri
      } else {
        uri = options.body ? `${uri}&${dataPath}` : uri
      }
      const fetchIndex = uri + method
      const results = fetchStack.get(fetchIndex)
      if (!results) {
        /* istanbul ignore if */
        const definedUri: string[] = []
        fetchStack.forEach((val, key) => {
          definedUri.push(key)
        })
        const error = new TypeError(
            `nothing expect response from server,
            uri: ${uri}, method: ${options.method},
            parsedUri: ${uri + method + dataPath}
            body: ${JSON.stringify(options.body, null, 2)},
            defined uri: ${JSON.stringify(definedUri, null, 2)}`
        )
        console.error(error)
        return Promise.reject(error)
      }
      let result: FetchResult
      if (results.length > 1) {
        result = results.shift()
      } else {
        result = results[0]
      }
      // console.log(uri + method + dataPath, fetchStack)
      const wait = result.wait
      if (!wait || wait < 0) {
        return Promise.resolve(new Response(result.response.data, result.response.responseInit))
      } else if (typeof wait === 'number') {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(new Response(result.response.data, result.response.responseInit))
          }, wait)
        })
      } else if (typeof wait.then !== 'undefined') {
        return wait.then(() => {
          return new Response(result.response.data, result.response.responseInit)
        })
      } else {
        return Promise.reject(new TypeError(`unsupported wait type, expected number or Promise`))
      }
    }
  }
}
