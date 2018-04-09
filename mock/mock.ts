declare const global: any

export interface FetchResult {
  wait: number | Promise<any> | undefined
  response: {
    data: any
    responseInit: ResponseInit
  }
}

export const fetchStack: Map<string, FetchResult[]> = new Map<string, any>()

export const buildQuery = (url: string, query: any) => {
  if (typeof query !== 'object' || !query) {
    return url
  }
  const result: string[] = []
  const pushKVToResult = pushKVEncoded(result)
  Object.keys(query).forEach((key) => {
    const val = query[key]
    if (key === '_') {
      console.warn('query should not contain key \'_\', it will be ignored')
      return
    }
    if (Array.isArray(val)) {
      val.forEach(_val => pushKVToResult(key, _val))
      return
    }
    pushKVToResult(key, val)
  })
  let _query: string
  if (url.indexOf('?') !== -1) {
    const hasExistingQueryInUrl = url.slice(-1) !== '?'
    const additionalQuery = result.join('&')
    _query = hasExistingQueryInUrl && additionalQuery
      ? '&' + additionalQuery
      : additionalQuery
  } else {
    _query = result.length ? '?' + result.join('&') : ''
  }
  return url + _query
}

const pushKVEncoded = (array: string[]) => (key: string, value: any): void => {
  if (typeof value === 'undefined') {
    return
  }

  const encodedValue = encodeURIComponent(String(value))
  array.push(`${key}=${encodedValue}`)
}

export function parseObject (query: any): string {
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
    .sort()
    .map(key => `${key}=${_query[key]}`)
    .join('&')
}

export function reParseQuery(uri: string): string {
  const queryPos = uri.indexOf('?')
  if (queryPos !== -1) {
    const query = uri.substr(queryPos + 1)
    const url = uri.substring(0, queryPos)
    const queryObject = Object.create(null)
    query.split('&').forEach(param => {
      const params = param.split('=')
      queryObject[params[0]] = params[1]
    })
    return url + '?' + parseObject(queryObject)
  }
  return uri
}

const context = typeof window !== 'undefined' ? window : global

const originFetch = context['fetch']

export function restore() {
  context['fetch'] = originFetch
}

export function mockFetch() {
  context['fetch'] = (uri: string, options: {
    method?: any,
    body?: any
  } = {}): any => {
    const method = options.method ? options.method.toLowerCase() : ''
    if (method !== 'options') {
      if (method === 'get') {
        const pos = uri.indexOf('_=')
        if (pos !== -1) {
          uri = uri.substr(0, pos - 1)
        }
      }
      uri = buildQuery(uri, options.body)
      const fetchIndex = reParseQuery(uri) + method
      const results = fetchStack.get(fetchIndex)
      if (!results) {
        /* istanbul ignore if */
        const definedUri: string[] = []
        fetchStack.forEach((_, key) => {
          definedUri.push(key)
        })
        const error = new TypeError(
            `nothing expect response from server,
            uri: ${uri}, method: ${options.method},
            body: ${JSON.stringify(options.body, null, 2)},
            defined uri: ${JSON.stringify(definedUri, null, 2)}`
        )
        console.error(error)
        return Promise.reject(error)
      }
      let result: FetchResult
      if (results.length > 1) {
        result = results.shift()!
      } else {
        result = results[0]
      }

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
