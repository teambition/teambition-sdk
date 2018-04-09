
import { Observable } from 'rxjs/Observable'
import { Subscriber } from 'rxjs/Subscriber'
import { SDK } from './SDK'

type OriginalResponse<T> = {
  nextPageToken: string,
  result: T[],
  totalSize: number
}

export type PaginationResponse<T> = {
  result: T[]
  hasMore: boolean
  totalSize: number
}

export type NextPage<T> = {
  update$: Observable<PaginationResponse<T>>,
  page: number
}

export type PaginationState<T> = {
  nextPageToken: string
  nextPage: number
  hasMore: boolean
  responseAcc: T[]
  totalSize: number | undefined
}

export class CursorPagination<T, K = any> {

  protected sdk: SDK

  /**
   * HTTP request constants
   */
  protected pageSize: number
  protected path: string
  protected urlQuery: any

  /**
   * HTTP request variables
   */
  protected nextPageToken: string
  protected nextPage: number
  protected hasMore: boolean
  protected totalSize: number | undefined
  protected responseAcc: T[]
  // protected mapper: ((headers: any, val: object) => K) | undefined
  protected lastHeaders: any
  protected abort: (() => void) | undefined
  private close$: Observable<void>

  protected static switch<T, K = any>(p: CursorPagination<T, K>) {
    if (typeof p.abort === 'function') {
      p.abort()
    }

    return new CursorPagination(p.sdk, p.pageSize, p.path, p.urlQuery, {
      nextPageToken: p.nextPageToken,
      nextPage: p.nextPage,
      hasMore: p.hasMore,
      responseAcc: p.responseAcc,
      totalSize: p.totalSize
    })
  }

  constructor(
    sdk: SDK,
    pageSize: number,
    path: string,
    urlQuery: any,
    state?: PaginationState<T>
  ) {
    this.sdk = sdk
    this.pageSize = pageSize
    this.nextPageToken = ''
    this.path = path
    this.urlQuery = urlQuery
    this.hasMore = true
    this.nextPage = 1
    this.responseAcc = []
    // this.mapper = mapper
    this.lastHeaders = {}

    this.close$ = new Observable((subscriber: Subscriber<void>) => {
      this.abort = () => {
        subscriber.complete()
        this.reset()
      }
    })

    if (state) {
      this.nextPageToken = state.nextPageToken
      this.nextPage = state.nextPage
      this.hasMore = state.hasMore
      this.responseAcc = state.responseAcc
      this.totalSize = state.totalSize
    }
  }

  toString() {
    const target = {
      endpoint: {
        url: this.sdk.fetch.getAPIHost() + this.path,
        query: this.urlQuery
      },
      protocol: `${ this.hasMore ? 'NEXT' : 'COMPLETE' }://${this.nextPage}-${this.nextPageToken}`,
      prevState: this.responseAcc
    }

    return JSON.stringify(target)
  }

  reset() {
    this.nextPageToken = ''
    this.nextPage = 1
    this.hasMore = true
    this.totalSize = undefined
    this.responseAcc = []
  }

  next(): NextPage<T> {
    const urlQuery = {
      ...this.urlQuery,
      pageToken: this.nextPageToken,
      pageSize: this.pageSize
    }

    const response$ = this.sdk.fetch.get<OriginalResponse<T>>(this.path, urlQuery, { includeHeaders: true })
      .do(({ headers, body }) => {
        const { nextPageToken, result, totalSize } = body
        this.lastHeaders = headers
        this.nextPageToken = nextPageToken
        this.hasMore = (result.length >= this.pageSize) && Boolean(nextPageToken)
        this.totalSize = totalSize
      })
      .map(({ body }) => body.result)

    this.nextPage++

    return {
      update$: response$
        .map((page) => {
          this.responseAcc = this.responseAcc.concat(page)
          return this.responseAcc
        })
        .map((pagesSince) => {
          return {
            result: pagesSince,
            hasMore: this.hasMore,
            totalSize: this.totalSize!,
            pagination: this
          }
        })
        .publishReplay(1)
        .refCount()
        .takeUntil(this.close$),
      page: this.nextPage
    }
  }

}
