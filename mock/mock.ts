'use strict'
import {IUserMe, ITaskData} from 'teambition'
import {flushState} from './backend'

declare const global

export const fetchStack = {}

export const parseObject = (obj: any) => {
  if (typeof obj === 'string') {
    obj = JSON.parse(obj)
  }
  let result = ''
  for (let key in obj) {
    let element = obj[key];
    if (element && typeof element === 'object') {
      result += key + parseObject(element)
    }else {
      result += key + element
    }
  }
  return result
}

const context = typeof window !== 'undefined' ? window : global

context['fetch'] = (uri: string, options?: {
  method?: any,
  body?: any
}) => {
  const method = options.method ? options.method.toLowerCase() : ''
  if (method !== 'options') {
    const dataPath = options.body ? parseObject(options.body) : ''
    const result = fetchStack[uri + method + dataPath]
    if (result && result.status === 200) {
      const promise = new Promise((resolve, reject) => {
        if (flushState.flushed) {
          resolve(result)
        }else {
          result.flushQueue.push([resolve, result])
        }
      })
      return promise
    }else if (result && result.status) {
      throw new Error(result.data)
    }else {
      throw new Error('nothing expect return from server')
    }
  }
}
