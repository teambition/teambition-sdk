'use strict'
import {IUserMe, ITaskData} from 'teambition'

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

window.fetch = (uri: string, options?: {
  method?: any,
  body?: any
}): Promise<any> => {
  const method = options.method ? options.method.toLowerCase() : ''
  if (method !== 'options') {
    const dataPath = options.body ? parseObject(options.body) : ''
    const result = fetchStack[uri + method + dataPath]
    if (result && result.status === 200) {
      const promise = new Promise((resolve, reject) => {
        resolve(result)
      })
      return promise
    }else if (result && result.status) {
      throw new Error(result.data)
    }else {
      throw new Error('nothing expect return from server')
    }
  }
}
