// copy from snapper-consumer.d.ts
export interface RequestObject {
  id: number
  jsonrpc: string
  method: 'publish' | 'notification' | 'success' | 'error' | 'invalid'
  params: string[] | any[]
}

export interface RequestEvent {
  id: number
  type: 'request' | 'invalid' | 'notification' | 'success' | 'error'
  data: RequestObject
}

export type SocketEventType = 'activity' | 'message' | 'project' | 'task' | 'subtask' |
                              'post' | 'work' | 'tasklist' | 'stage' |
                              'collection' | 'tag' | 'user' | 'preference' | 'member' |
                              'event' | 'subscriber' | 'feedback' | 'homeActivity' | 'works' |
                              'tasks'

export interface ToPromiseObject {
  toPromise: () => Promise<any>
}

export class SocketMock {
  onmessage: (e: RequestEvent) => Promise<any>

  private _id = 1

  constructor(SocketClient: any) {
    SocketClient.initClient(this, {})
  }

  public makeMessage = (data: RequestObject): RequestEvent => {
    this._id = this._id + 1
    return {
      id: this._id,
      type: 'request',
      data
    }
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
    objectId?: string,
    patch?: any,
    delay: number | Promise<any> | ToPromiseObject = 0
  ): Promise<any> {
    const eTail = objectId ? `/${objectId}` : ''
    const params = {
      e: `:${method}:${objectType}${eTail}`,
      d: patch
    }

    const result = this.makeMessage({
      id: this._id,
      jsonrpc: '2.0',
      method: 'publish',
      params: [ JSON.stringify(params) ]
    })

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
