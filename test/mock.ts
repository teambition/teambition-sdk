'use strict'
import {IUserMe, ITaskData} from 'teambition'

const fetchStack = {}

window.fetch = (uri: string): Promise<any> => {
  const result = fetchStack[uri]
  if (result) {
    const promise = new Promise((resolve, reject) => {
      resolve(result)
    })
    return promise
  }else {
    throw new Error('nothing expect return from server')
  }
}

export const mock = (target: any) => {
  const keys = Object.keys(target)
  console.log(keys)
}
