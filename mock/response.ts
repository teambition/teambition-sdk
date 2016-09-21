'use strict'
import { fetchStack, parseObject } from './mock'

export class HttpResponse {
  private namespace: string

  constructor(uri: string, method?: string, data?: any) {
    let dataPath: string
    try {
      dataPath = data ? parseObject(data) : ''
    } catch (error) {
      throw error
    }
    method = method ? method.toLowerCase() : ''
    this.namespace = uri + method + dataPath
  }

  empty(): HttpResponse {
    fetchStack.delete(this.namespace)
    return this
  }

  respond(
    data: any,
    response: ResponseInit = {
      status: 200
    },
    wait?: number | Promise<any>
  ) {
    const status = response.status || 200
    response.status = status
    if (typeof status !== 'number') {
      throw new Error(`status code must be a Number, ${status} is not valid`)
    }
    if (status < 200 || status >= 400) {
      throw new Error(`${status} is not a valid success Http Response, you should use .error method instead`)
    }
    if (typeof data === 'string') {
      data = data === '' ? '' : data
    } else if (typeof data === 'object') {
      data = JSON.stringify(data)
    } else {
      throw(new Error(`Not valid data format, uri: ${this.namespace}, data: ${data}`))
    }
    const result = {
      wait, response: {
        data, responseInit: response
      }
    }
    if (!fetchStack.has(this.namespace)) {
      fetchStack.set(this.namespace, [ result ])
    } else {
      fetchStack.get(this.namespace).push(result)
    }
  }

  error(message: string, response: ResponseInit, wait?: number | Promise<any>) {
    const result = {
      wait, response: {
        data: message, responseInit: response
      }
    }
    if (!fetchStack.has(this.namespace)) {
      fetchStack.set(this.namespace, [result])
    } else {
      fetchStack.get(this.namespace).push(result)
    }
  }
}
