import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { TeardownLogic } from 'rxjs/Subscription'

export interface WorkerMessage<T> {
  id: number
  result: {
    data: T
    complete?: boolean
  }
}

export class WorkerClient {
  private nextId = 0

  static create(workerUrl: string) {
    if ('Worker' in window) {
      return new WorkerClient(new Worker(workerUrl))
    }
    throw new Error('Browser dos not support web worker')
  }

  private constructor(private worker: Worker) { }

  postMessage<T>(method: string, params?: any): Observable<T> {
    const id = this.nextId++
    return Observable.create((observer: Observer<T>): TeardownLogic => {
      const msgHandler = (resp: MessageEvent) => {
        const { id: respId, result } = resp.data as WorkerMessage<T>
        if (id === respId) {
          observer.next(result.data)
          result.complete && observer.complete()
        }
      }

      const errHandler = (err: ErrorEvent) => observer.error(err)

      this.worker.postMessage({ id, method, params })

      this.worker.addEventListener('message', msgHandler)
      this.worker.addEventListener('error', errHandler)

      return () => {
        this.worker.postMessage({ id, method: 'unsubscribe' })
        this.worker.removeEventListener('message', msgHandler)
        this.worker.removeEventListener('error', errHandler)
      }
    })
  }

  terminate() {
    this.worker.terminate()
  }
}
