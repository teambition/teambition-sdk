'use strict'
import { RequestEvent } from 'snapper-consumer'
import { forEach } from '../utils/index'

export interface MessageResult {
  method: string
  id: string
  type: string
  data: any
}

export function eventParser(event: RequestEvent) {
  const data = event.data
    const methodAndDatas: MessageResult[] = []
    if (data) {
      const params = data.params
      if (params && params.length) {
        forEach(params, param => {
          let result: {
            e: string,
            d: any
          }
          try {
            result = JSON.parse(param)
          }catch (e) {
            return console.error(e)
          }
          const methodAndData: MessageResult = parser(result.e)
          methodAndData.data = result.d
          methodAndDatas.push(methodAndData)
        })
      }
    }
    return methodAndDatas
}

const tokens = [':', '/']
const BEGIN_STATE = 'BEGIN_STATE'
const METHOD_STATE = 'METHOD_STATE'
const TYPE_STATE = 'TYPE_STATE'
const ID_STATE = 'ID_STATE'

function parser(str: string) {
  const length = str.length
  const result: MessageResult = {
    method: '',
    id: '',
    type: '',
    data: null
  }
  let state = BEGIN_STATE
  let i = -1
  while (++i < length) {
    const substr = str[i]
    const pos = tokens.indexOf(substr)
    switch (pos) {
      case -1:
        readToken(result, substr, state)
        break
      case 0:
        if (state === BEGIN_STATE) {
          state = METHOD_STATE
        }else if (state === METHOD_STATE) {
          state = TYPE_STATE
        }
        break
      case 1:
        state = ID_STATE
        break
    }
  }
  return result
}

function readToken (result: MessageResult, str: string, state: string) {
  switch (state) {
    case METHOD_STATE:
      result.method = result.method + str
      break
    case TYPE_STATE:
      result.type = result.type + str
      break
    case ID_STATE:
      result.id = result.id + str
      break
  }
}
