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
                              'collection' | 'tag' | 'user' | 'preference' | 'member' |
                              'event' | 'subscriber' | 'feedback' | 'homeActivity'

export interface ToPromiseObject {
  toPromise: () => Promise<any>
}

export class SocketMock {
  onmessage: (e: RequestEvent) => Promise<any>

  private _ctx = typeof global === 'undefined' ? window : global
  private _sdk = this._ctx['teambition'].sdk
  private _id = 1

  constructor() {
    this._sdk.socket.initClient(this)
  }

  emit(
    method: 'change' | 'destroy' | 'refresh' | 'remove',
    objectType: SocketEventType,
    objectId: string,
    patch?: any,
    delay?: number | Promise<any> | ToPromiseObject
  ): Promise<any>

  emit(
    method: 'new',
    objectType: SocketEventType,
    objectId: '',
    patch?: any,
    delay?: number | Promise<any> | ToPromiseObject
  ): Promise<any>

  emit(
    method: 'change' | 'destroy' | 'new' | 'refresh' | 'remove',
    objectType: SocketEventType,
    objectId: string,
    patch?: any,
    delay: number | Promise<any> | ToPromiseObject = 0
  ): Promise<any> {
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
    if (typeof delay === 'number') {
      if (delay > 0) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve()
          }, delay)
        })
          .then(() => {
            return this.onmessage(result)
          })
      } else {
        return this.onmessage(result)
      }
    } else if (typeof delay['then'] === 'function') {
      return (<Promise<any>>delay).then(() => {
        return this.onmessage(result)
      })
    } else if (typeof delay['toPromise'] === 'function') {
      return (<ToPromiseObject>delay).toPromise()
        .then(() => {
          return this.onmessage(result)
        })
    } else {
      return Promise.reject(new TypeError(`not a valid delay type, expected number or Promise or Observable`))
    }
  }
}
