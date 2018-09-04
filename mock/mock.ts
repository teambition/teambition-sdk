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
  return appendQueryString(url, toQueryString(query))
}

const appendQueryString = (url: string, queryString: string) => {
  if (!queryString) {
    return url
  }
  if (url.slice(-1) === '?') { // '?' 是最后一个字符
    return `${url}${queryString}`
  }
  return url.indexOf('?') === -1
    ? `${url}?${queryString}`  // '?' 不存在
    : `${url}&${queryString}`  // '?' 存在，其后还有其他字符
}

const toQueryString = (query: any) => {
  if (typeof query !== 'object' || !query) {
    return ''
  }
  const result: string[] = []
  Object.keys(query).forEach((key) => {
    const val = query[key]
    if (key === '_') {
      console.warn('query should not contain key \'_\', it will be ignored')
    } else if (Array.isArray(val)) {
      val.forEach(_val => {
        result.push(`${key}=${encoded(_val)}`)
      })
    } else if (typeof val !== 'undefined') {
      result.push(`${key}=${encoded(val)}`)
    }
  })
  return result.join('&')
}

const encoded = (value: {} | null): string => {
  const encodedRegExp = /^(%(\d|[a-fA-F]){2}|[a-zA-Z0-9]|-|_|\.|!|~|\*|'|\(|\))*$/
  //                       ^percent-encoded^ ^^^^^^^^^^^^^escaped^^^^^^^^^^^^^w
  const maybeEncoded = String(value)
  return encodedRegExp.test(maybeEncoded)
    ? maybeEncoded
    : encodeURIComponent(maybeEncoded)
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
