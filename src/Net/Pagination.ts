import * as rx from '../rx'

export type PageToken = string & { kind: 'PageToken' }

export const emptyPageToken = '' as PageToken

export interface State<T = {}> {
  urlPath: string

  pageSize?: number
  urlQuery?: {}

  nextPageToken: PageToken
  totalSize?: number
  result: T[]

  nextPage: number
  hasMore: boolean
}

export function defaultState<T>(
  urlPath: string,
  options: {
    pageSize?: number
    urlQuery?: {}
  } = {}
): State<T> {
  const raw: State<T> = {
    urlPath: urlPath,
    nextPageToken: emptyPageToken,
    totalSize: undefined,
    result: [],

    nextPage: 1,
    hasMore: true
  }
  if (options.pageSize) {
    Object.assign(raw, { pageSize: options.pageSize })
  }
  if (options.urlQuery) {
    const { pageSize, ...nonPaginationQuery } = options.urlQuery as any
    Object.assign(raw, { urlQuery: nonPaginationQuery })
    if (!raw.pageSize && pageSize) {
      raw.pageSize = pageSize
    }
  }
  return raw
}

export type OriginalResponse<T> = {
  nextPageToken: PageToken
  result: T[]
  totalSize?: number
}

export const accumulateResultByConcat = <T>(state: State<T>, resp: OriginalResponse<T>): State<T> => {
  return {
    ...state,
    totalSize: resp.totalSize,
    nextPageToken: resp.nextPageToken,
    result: state.result.concat(resp.result),
    nextPage: state.nextPage + 1,
    hasMore: Boolean(resp.nextPageToken) && resp.result.length === state.pageSize
  }
}

export const loadAndExpand = <T>(
  step: (curr: State<T>) => rx.Observable<OriginalResponse<T>>,
  initState: State<T>,
  loadMore$: rx.Observable<{}> = rx.empty()
): rx.Observable<State<T>> => {
  return loadMore$
    .pipe(
      rx.startWith({}),
      expand(step, accumulateResultByConcat, initState),
      rx.mergeAll()
    )
}

export const expand = <T>(
  step: (curr: State<T>) => rx.Observable<OriginalResponse<T>>,
  accumulator: (state: State<T>, resp: OriginalResponse<T>) => State<T>,
  initState: State<T>
): rx.OperatorFunction<{}, rx.Observable<State<T>>> => (
  source$
) => {
  const state = { ...initState }
  let isLoading = false

  return new rx.Observable((observer) => {
    const subs = source$.subscribe({
      next: (_) => {
        if (!state.hasMore) {
          observer.complete()
          return
        }
        if (!isLoading) {
          isLoading = true
          observer.next(step(state)
            .pipe(
              rx.map((stepResult) => accumulator(state, stepResult)),
              rx.tap((expanded) => Object.assign(state, expanded)),
              rx.catch((err) => rx.throw(err)),
              rx.finalize(() => { isLoading = false })
            )
          )
        }
      },
      error: (err) => {
        isLoading = false
        observer.error(err)
      },
      complete: () => {
        observer.complete()
      }
    })

    return () => {
      subs.unsubscribe()
    }
  })
}
