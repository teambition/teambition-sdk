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

  respond(data: any) {
    fetchStack.set(this.namespace, {
      status: 200,
      flushQueue: [],
      json: () => {
        if (typeof data === 'string') {
          return Promise.resolve(data === '' ? Object.create(null) : JSON.parse(data))
        }else if (typeof data === 'object') {
          return Promise.resolve(data)
        }else {
          return Promise.reject(new Error(`Not valid data format, uri: ${this.namespace}, data: ${data}`))
        }
      }
    })
  }

  error(message: any, status: number) {
    fetchStack.set(this.namespace, {
      status: status,
      data: message,
      json: () => {
        return Promise.resolve(message)
      }
    })
  }
}
