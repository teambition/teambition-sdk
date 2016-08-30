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

  respond(data: any) {
    const json = () => {
      if (typeof data === 'string') {
        return Promise.resolve(data === '' ? '' : JSON.parse(data))
      } else if (typeof data === 'object') {
        return Promise.resolve(data)
      } else {
        return Promise.reject(new Error(`Not valid data format, uri: ${this.namespace}, data: ${data}`))
      }
    }
    const result = {
      status: 200,
      flushQueue: {
        data: {
          status: 200, json, response: data
        }
      }, json, data
    }
    if (!fetchStack.has(this.namespace)) {
      fetchStack.set(this.namespace, [ result ])
    } else {
      fetchStack.get(this.namespace).push(result)
    }
  }

  error(message: any, status: number) {
    const json = () => {
      return Promise.resolve(message)
    }
    const result = {
      status, reason: message,
      flushQueue: {
        data: {
          status, json, response: message
        }
      }, json
    }
    if (!fetchStack.has(this.namespace)) {
      fetchStack.set(this.namespace, [result])
    } else {
      fetchStack.get(this.namespace).push(result)
    }
  }
}
