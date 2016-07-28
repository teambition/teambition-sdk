'use strict'

declare const global: any

// copy from snapper-consumer.d.ts
export interface RequestObject {
  id: number
  jsonrpc: string
  method: 'publish' | 'notification' | 'success' | 'error' | 'invalid'
  params: string[]
}

export interface RequestEvent {
  id: number
  type: 'request' | 'invalid' | 'notification' | 'success' | 'error'
  data: RequestObject
}

export type SocketEventType = 'activity' | 'message' | 'project' | 'task' | 'subtask' |
                              'post' | 'work' | 'tasklist' | 'stage' |
                              'collection' | 'tag' | 'user' | 'preference'

export class SocketMock {
  onmessage: (e: RequestEvent) => void

  private _ctx = typeof global === 'undefined' ? window : global
  private _sdk = this._ctx['teambition'].sdk
  private _id = 1

  constructor() {
    this._sdk.socket.initClient(this)
  }

  emit(
    method: 'change' | 'destroy' | 'new' | 'refresh',
    objectType: SocketEventType,
    objectId: string,
    patch?: any,
    delay = 500
  ) {
    const params = {
      e: `:${method}:${objectType}/${objectId}`,
      d: patch
    }
    this._id = this._id + 1
    const result: RequestEvent = {
      id: this._id,
      type: 'request',
      data: {
        id: this._id,
        jsonrpc: '2.0',
        method: 'publish',
        params: [ JSON.stringify(params) ]
      }
    }
    setTimeout(() => {
      this.onmessage(result)
    }, delay)
  }
}
