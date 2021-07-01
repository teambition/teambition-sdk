import { Observable } from 'rxjs/Observable'
import { of } from 'rxjs/observable/of'
import { timer } from 'rxjs/observable/timer'
import { _throw } from 'rxjs/observable/throw'

import { SDKFetch, SDKFetchOptions } from './SDKFetch'
import { appendQueryString, toQueryString } from './utils'

interface PollingOptions {
  /**
   * 最大轮询数
   */
  maxTimes?: number
  /**
   * 轮询间隔
   */
  interval?: number
  /**
   * 最大轮询间隔
   */
  maxInterval?: number
  /**
   * 轮询间隔步长
   */
  intervalSteps?: number
}

export interface AsyncJobOptions<T> extends AsyncJobCallbacks<T> {
  timeoutSeconds?: number // 客户端愿意等待的时间
  readySid?: string // consumerId
  pollingOptions?: PollingOptions
}

interface AsyncJobCallbacks<T> {
  onPending?: () => void
  onFulfilled?: (res: T) => void
  onRejected?: (e: Error) => void
}

type Options<T> = SDKFetchOptions & AsyncJobOptions<T>

interface AsyncResult {
  readyKey: string
  result: null
  timeout: boolean
}

interface AsyncJobInfo<T> {
  isDone: boolean // job是否完成
  timeCost?: number // job消耗的毫秒数
  statusCode?: number // job执行响应码(response.status 的冗余)
  request: { // 原始请求
    headers: string
    url: string // 原始请求链接
    body?: {}
  }
  response?: { // 执行结果，如果项目还没有准备好，response可能为null
    status: number // job响应码
    headers: string // job响应头
    body: T // job响应体
  }
}

interface AsyncJobsRes<T> {
  result: Record<string, AsyncJobInfo<T>>
}

const DefaultPollInterval = 3000
const DefaultSteps = 1.2
const DefaultMaxPollInterval = 1000 * 10
const DefaultMaxPollTimes = 7

export class SDKAsyncJob {

  constructor(private fetch: SDKFetch) {}

  get<T>(path: string, query?: Object, options: Options<T> = {}) {
    const { onPending, onFulfilled, onRejected, timeoutSeconds, readySid, pollingOptions, ...rest } = options
    const callbacks: AsyncJobCallbacks<T> = { onPending, onFulfilled, onRejected }

    const q = this.normalizeQuery(query, timeoutSeconds, readySid)
    return this.fetch.get<T>(path, q, rest)
      .switchMap((res: T | AsyncResult) => this.handleRes(res, callbacks, pollingOptions))
  }

  post<T>(path: string, body?: any, options: Options<T> = {}) {
    const { onPending, onFulfilled, onRejected, timeoutSeconds, readySid, pollingOptions, ...rest } = options
    const callbacks: AsyncJobCallbacks<T> = { onPending, onFulfilled, onRejected }

    const query = this.normalizeQuery(void 0, timeoutSeconds, readySid)
    const url = this.appendQueryToUrl(path, query)
    return this.fetch.post<T>(url, body, rest)
      .switchMap((res: T | AsyncResult) => this.handleRes( res, callbacks, pollingOptions ))
  }

  put<T>(path: string, body?: any, options: Options<T> = {}) {
    const { onPending, onFulfilled, onRejected, timeoutSeconds, readySid, pollingOptions, ...rest } = options
    const callbacks: AsyncJobCallbacks<T> = { onPending, onFulfilled, onRejected }

    const query = this.normalizeQuery(void 0, timeoutSeconds, readySid)
    const url = this.appendQueryToUrl(path, query)
    return this.fetch.put<T>(url, body, rest)
      .switchMap((res: T | AsyncResult) => this.handleRes( res, callbacks, pollingOptions ))
  }

  delete<T>(path: string, body?: any, options: Options<T> = {}) {
    const { onPending, onFulfilled, onRejected, timeoutSeconds, readySid, pollingOptions, ...rest } = options
    const callbacks: AsyncJobCallbacks<T> = { onPending, onFulfilled, onRejected }

    const query = this.normalizeQuery(void 0, timeoutSeconds, readySid)
    const url = this.appendQueryToUrl(path, query)
    return this.fetch.delete<T>(url, body, rest)
      .switchMap((res: T | AsyncResult) => this.handleRes( res, callbacks, pollingOptions ))
  }

  private appendQueryToUrl(url: string, q: Object) {
    return appendQueryString(url, toQueryString(q))
  }

  private handleRes<T>(
    res: T | AsyncResult,
    callbacks: AsyncJobCallbacks<T>,
    pollingOptions: PollingOptions = {},
  ) {
    // 如果资源在正常时间范围内返回，则直接返回资源
    if (!this.isAsyncResult(res)) {
      return of(res)
    }

    if (callbacks.onPending) {
      callbacks.onPending()
    }

    const {
      maxTimes = DefaultMaxPollTimes,
      interval = DefaultPollInterval,
      maxInterval = DefaultMaxPollInterval,
      intervalSteps = DefaultSteps,
    } = pollingOptions

    return this.waitingForJobDone<T>(res.readyKey, callbacks, {
      maxTimes,
      interval,
      maxInterval,
      intervalSteps,
    })
  }

  private waitingForJobDone<T>(
    key: string,
    callbacks: AsyncJobCallbacks<T>,
    pollingOptions: Required<PollingOptions>,
  ) {
    const polling$ = this.getAsyncJobResult<T>(key) // 轮询前先查询一次
      .switchMap(res => {
        if (res === null) {
          return this.polling<T>(
            key,
            0,
            callbacks,
            pollingOptions,
          )
        }
        if (callbacks.onFulfilled) {
          callbacks.onFulfilled(res)
        }
        return of(res)
      })

    return polling$
  }

  private polling<T>(
    key: string,
    times: number,
    callbacks: AsyncJobCallbacks<T>,
    pollingOptions: Required<PollingOptions>,
  ): Observable<T> {
    const {
      intervalSteps,
      maxInterval,
      maxTimes,
      interval,
    } = pollingOptions
    return timer(interval)
      .switchMap(() => this.getAsyncJobResult<T>(key))
      .switchMap(res => {
        if (res === null) {
          if (times > maxTimes) {
            const e = new Error('Async job polling failed')
            if (callbacks.onRejected) {
              callbacks.onRejected(e)
            }
            return _throw(e)
          }

          const nextTimes = times + 1
          const nextOptions = {
            intervalSteps,
            maxInterval,
            maxTimes,
            interval: Math.floor(Math.min(interval * intervalSteps, maxInterval)),
          }
          return this.polling<T>(key, nextTimes, callbacks, nextOptions)
        }
        if (callbacks.onFulfilled) {
          callbacks.onFulfilled(res)
        }
        return of(res)
      })
  }

  private getAsyncJobResult<T>(key: string): Observable<T | null> {
    return this.fetch.get<AsyncJobsRes<T>>('async-jobs', { keys: [key] })
      .map(m => {
        const r = m.result[key]

        if (r.response && r.response.status && r.response.status >= 400) {
          throw new Error(`${r.response.body || r.response.status}`)
        }

        if (r.isDone) {
          if (!r.response) {
            throw new Error('response is undefined')
          }
          return r.response.body
        }
        return null
      })
  }

  /**
   * 判断资源是否需要异步等待
   */
  private isAsyncResult(res: any): res is AsyncResult {
    if (typeof res !== 'object') {
      return false
    }

    if ('timeout' in res && 'readyKey' in res) {
      return true
    }

    return false
  }

  private normalizeQuery(
    query?: Object,
    timeoutSeconds: number = 3, // 默认等待 3 秒
    readySid: string = '',
  ) {
    return {
      timeoutAsync: true,
      timeoutSeconds,
      readySid,
      ...query,
    }
  }

}
