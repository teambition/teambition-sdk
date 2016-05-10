'use strict'
import {fetchStack, parseObject} from './mock'

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
    fetchStack[this.namespace] = {
      status: 200,
      flushQueue: [],
      json: () => {
        if (typeof data === 'string') {
          return JSON.parse(data)
        }else if (typeof data === 'object') {
          return data
        }
      }
    }
  }

  error(message: any, status: number) {
    fetchStack[this.namespace] = {
      status: status,
      data: message,
      json: () => {
        return message
      }
    }
  }
}
