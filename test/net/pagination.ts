import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'tman'
import { Observable, Scheduler } from 'rxjs'
import { SDKFetch } from '..'
import * as page from '../../src/Net/Pagination'
import { expandPage } from '../../src/apis/pagination'

const fetchMock = require('fetch-mock')

describe('Pagination Spec', () => {
  const urlPath = 'task'
  const pageSize = 3
  const sampleResponse = {
    result: [1, 2, 3],
    nextPageToken: '456' as page.PageToken
  }

  it(`${page.defaultState.name} should be immutable`, () => {
    const app1Changes = page.defaultState(urlPath)
    const app2remains = page.defaultState(urlPath)
    Object.assign(app1Changes, { paginationUrlPath: 'event' })
    Object.assign(app1Changes, { additional: 'info' })
    expect(app2remains).to.deep.equal(page.defaultState(urlPath))
  })

  it(`${page.defaultState.name} should allow options: pageSize`, () => {
    expect(page.defaultState(urlPath, { pageSize: 11 }).pageSize).to.equal(11)
  })

  it(`${page.defaultState.name} should allow options: urlQuery`, () => {
    expect(page.defaultState(urlPath, { urlQuery: {} }).urlQuery).to.deep.equal({})
    expect(page.defaultState(urlPath, { urlQuery: { q: 'haha' } }).urlQuery).to.deep.equal({ q: 'haha' })
  })

  it(`${page.defaultState.name} should allow pageSize be specified in options.urlQuery`, () => {
    expect(page.defaultState(urlPath, { urlQuery: { pageSize: 11 } }).pageSize).to.equal(11)
    expect(page.defaultState(urlPath, { pageSize: 11, urlQuery: { pageSize: 22 } }).pageSize).to.equal(11)
  })

  it(`${page.expand.name} should complete on source$ completion`, function* () {
    const source$ = Observable.empty()
    const expandOp = page.expand(
      () => Observable.of(sampleResponse),
      page.accumulateResultByConcat,
      page.defaultState('')
    )
    let isCompleted = false
    yield source$.pipe(expandOp).mergeAll().do({
      complete: () => {
        isCompleted = true
      }
    })
    yield Observable.of(isCompleted)
      .do((x) => {
        expect(x).to.be.true
      })
  })

  it(`${page.expand.name} should complete on hasMore: false`, function* () {
    let hasMore = true
    const sampleHasNoMoreResponse = {
      result: [4, 5, 6],
      nextPageToken: page.emptyPageToken
    }
    const expandOp = page.expand(
      () => {
        if (!hasMore) {
          hasMore = false
          return Observable.of(sampleHasNoMoreResponse)
        }
        return Observable.of(sampleResponse)
      },
      page.accumulateResultByConcat,
      page.defaultState('')
    )
    let isCompleted = false
    const infiniteSource$ = Observable.interval()
    yield infiniteSource$.pipe(expandOp).mergeAll().do({
      complete: () => {
        isCompleted = true
      }
    }).take(10) // 避免出错时，由 infiniteSource$ 造成的无限溢出的问题
    yield Observable.of(isCompleted)
      .do((x) => {
        expect(x).to.be.true
      })
  })

  it(`${page.expand.name} should error on source$ error`, function* () {
    const sampleError = new Error('source$ error')
    const source$ = Observable.throw(sampleError)
    const expandOp = page.expand(
      () => Observable.of(sampleResponse),
      page.accumulateResultByConcat,
      page.defaultState('')
    )
    let isErrorPassedThrough = false
    yield source$.pipe(expandOp).mergeAll().do({
      error: () => {
        isErrorPassedThrough = true
      }
    }).catch(() => Observable.empty())
    yield Observable.of(isErrorPassedThrough)
      .do((x) => {
        expect(x).to.be.true
      })
  })

  it(`${page.expand.name} should allow retry on source$ error`, function* () {
    const sampleError = new Error('source$ error')
    let hasThrown = false
    const source$ = Observable.of('fail at first, succeed for the rest').do(() => {
      if (!hasThrown) {
        hasThrown = true
        throw sampleError
      }
    })
    const expandOp = page.expand(
      () => Observable.of(sampleResponse),
      page.accumulateResultByConcat,
      page.defaultState('')
    )
    yield source$.pipe(expandOp).mergeAll().do((x) => {
      expect(x.nextPageToken).to.equal('456')
      expect(x.result.slice(-pageSize)).to.deep.equal([1, 2, 3])
    }).retry(2)
  })

  // todo(dingwen): use marble test instead
  it(`${page.expand.name} should ignore source$ when the current load is yet to be completed`, function* () {
    const source$ = Observable.interval(10).take(3)
    const expandOp = page.expand(
      () => Observable.of(sampleResponse).delay(25),
      page.accumulateResultByConcat,
      page.defaultState('')
    )
    const page$ = source$.pipe(expandOp).mergeAll().publishReplay(1).refCount()

    let earliestFirst: any = null
    const earliestFirst$ = page$.takeUntil(Observable.timer(40))
    yield earliestFirst$
      .do((x) => {
        earliestFirst = x
      })
    yield Observable.of(earliestFirst)
      .do((x) => {
        expect(x.result).to.deep.equal([1, 2, 3])
      })

    let emitOnlyOnce: any = null
    const emitOnlyOnce$ = page$.takeUntil(Observable.timer(60))
    yield emitOnlyOnce$
      .do((x) => {
        emitOnlyOnce = x
      })
    yield Observable.of(emitOnlyOnce)
      .do((x) => {
        expect(x.result).to.deep.equal([1, 2, 3])
      })
  })

  it(`${page.expand.name} should not block second load when the first load has failed`, function* () {
    const sampleError = new Error('first load failed')
    let hasThrown = false
    const expandOp = page.expand(
      () => {
        if (!hasThrown) {
          hasThrown = true
          return Observable.throw(sampleError)
        }
        return Observable.of(sampleResponse)
      },
      page.accumulateResultByConcat,
      page.defaultState('')
    )
    yield Observable.from(['first load', 'second load'])
      .pipe(expandOp)
      .mergeMap((stream) => stream.catch(() => Observable.empty()))
      .take(1)
      .subscribeOn(Scheduler.asap)
      .do((state: any) => {
        expect(state.nextPageToken).to.equal(sampleResponse.nextPageToken)
        expect(state.result.slice(-pageSize)).to.deep.equal(sampleResponse.result)
      })
  })

  it(`${page.expand.name} should not block next load when current load has failed`, function* () {
    const sampleError = new Error('current load failed')
    const sampleNextResponse = {
      result: [4, 5, 6],
      nextPageToken: '789' as page.PageToken
    }
    let hasThrown = false
    const expandOp = page.expand(
      () => {
        if (!hasThrown) {
          hasThrown = true
          return Observable.throw(sampleError)
        }
        return Observable.of(sampleNextResponse)
      },
      page.accumulateResultByConcat,
      {
        ...page.defaultState(''),
        nextPage: 2,
        nextPageToken: '456' as page.PageToken,
        result: [1, 2, 3]
      }
    )
    yield Observable.from(['current load', 'next load'])
      .pipe(expandOp)
      .mergeMap((stream) => stream.catch(() => Observable.empty()))
      .take(1)
      .subscribeOn(Scheduler.asap)
      .do((state: any) => {
        expect(state.nextPageToken).to.equal(sampleNextResponse.nextPageToken)
        expect(state.result.slice(-pageSize)).to.deep.equal(sampleNextResponse.result)
      })
  })

})

describe(`${expandPage.name}`, () => {
  let sdkFetch: SDKFetch
  const apiHost = 'https://www.teambition.com/api'
  const urlPath = 'task'
  const testUrl = `${apiHost}/${urlPath}`

  beforeEach(() => {
    sdkFetch = new SDKFetch(apiHost)
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('should not emit new state when request fails', () => {
    fetchMock.get(new RegExp(testUrl), { status: 404 })

    const initial = page.defaultState(urlPath, { pageSize: 5 })
    return sdkFetch.expandPage(initial)
      .toPromise()
      .then(() => {
        throw new Error('should not emit new state when request fails')
      })
      .catch((err) => {
        expect(err.error.status).to.equal(404)
      })
  })

  it('should emit new state (based on initial state) on successful request', () => {
    fetchMock.get(new RegExp(testUrl), {
      nextPageToken: 'asdf',
      totalSize: 66,
      result: [1, 2, 3, 4, 5]
    })

    const initial = page.defaultState(urlPath, { pageSize: 5 })
    return sdkFetch.expandPage(initial)
      .take(1)
      .toPromise()
      .then((resultState) => {
        expect(resultState).to.deep.equal({
          urlPath,
          nextPageToken: 'asdf',
          totalSize: 66,
          result: [1, 2, 3, 4, 5],
          nextPage: 2,
          hasMore: true,
          pageSize: 5
        })
      })
  })

  it('should emit new state (based on non-initial state) on successful request', () => {
    fetchMock.get(new RegExp(testUrl), {
      nextPageToken: 'ghjk',
      totalSize: 66,
      result: [6, 7, 8, 9, 10]
    })

    const currState: page.State = {
      urlPath,
      nextPageToken: 'asdf' as page.PageToken,
      totalSize: 66,
      result: [1, 2, 3, 4, 5],
      nextPage: 2,
      hasMore: true,
      pageSize: 5
    }
    return sdkFetch.expandPage(currState)
      .take(1)
      .toPromise()
      .then((resultState) => {
        expect(resultState).to.deep.equal({
          urlPath: urlPath,
          nextPageToken: 'ghjk',
          totalSize: 66,
          result: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          nextPage: 3,
          hasMore: true,
          pageSize: 5
        })
      })
  })

  it('should mutate state on successful request on options.mutate: true', () => {
    fetchMock.get(new RegExp(testUrl), {
      nextPageToken: 'asdf',
      totalSize: 66,
      result: [1, 2, 3, 4, 5]
    })

    const initial = page.defaultState(urlPath, { pageSize: 5 })
    return sdkFetch.expandPage(initial, { mutate: true })
      .take(1)
      .toPromise()
      .then(() => {
        expect(initial).to.deep.equal({
          urlPath,
          nextPageToken: 'asdf',
          totalSize: 66,
          result: [1, 2, 3, 4, 5],
          nextPage: 2,
          hasMore: true,
          pageSize: 5
        })
      })
  })

  it('should allow mapFn to be applied to all the items in result', () => {
    fetchMock.get(new RegExp(testUrl), {
      nextPageToken: 'ghjk',
      totalSize: 66,
      result: [6, 7, 8, 9, 10]
    })

    const currState: page.State<number> = {
      urlPath,
      nextPageToken: 'asdf' as page.PageToken,
      totalSize: 66,
      result: [0, 1, 2, 3, 4],
      nextPage: 2,
      hasMore: true,
      pageSize: 5
    }
    return sdkFetch.expandPage<number>(currState, {
      urlQuery: {},
      mapFn: (i) => i - 1
    })
      .take(1)
      .toPromise()
      .then((resultState) => {
        expect(resultState).to.deep.equal({
          urlPath,
          nextPageToken: 'ghjk',
          totalSize: 66,
          result: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          nextPage: 3,
          hasMore: true,
          pageSize: 5
        })
      })
  })

  it('should allow mapFn to receive current response headers as an argument', () => {
    fetchMock.get(new RegExp(testUrl), {
      headers: { 'x-request-id': '20180608' },
      body: {
        nextPageToken: 'ghjk',
        totalSize: 66,
        result: [6, 7, 8, 9, 10]
      }
    })

    const currState: page.State<{ value: number, sessionId: string }> = {
      urlPath,
      nextPageToken: 'asdf' as page.PageToken,
      totalSize: 66,
      result: [
        { value: 0, sessionId: '20180607' },
        { value: 1, sessionId: '20180607' },
        { value: 2, sessionId: '20180607' },
        { value: 3, sessionId: '20180607' },
        { value: 4, sessionId: '20180607' },
      ],
      nextPage: 2,
      hasMore: true,
      pageSize: 5
    }
    return sdkFetch.expandPage<number, { value: number, sessionId: string }>(
      currState,
      {
        urlQuery: {},
        mapFn: (i, _1, _2, headers) => ({
          value: i - 1,
          sessionId: headers.get('x-request-id')!
        })
      }
    )
      .take(1)
      .toPromise()
      .then((resultState) => {
        expect(resultState).to.deep.equal({
          urlPath,
          nextPageToken: 'ghjk',
          totalSize: 66,
          result: [
            { value: 0, sessionId: '20180607' },
            { value: 1, sessionId: '20180607' },
            { value: 2, sessionId: '20180607' },
            { value: 3, sessionId: '20180607' },
            { value: 4, sessionId: '20180607' },
            { value: 5, sessionId: '20180608' },
            { value: 6, sessionId: '20180608' },
            { value: 7, sessionId: '20180608' },
            { value: 8, sessionId: '20180608' },
            { value: 9, sessionId: '20180608' }
          ],
          nextPage: 3,
          hasMore: true,
          pageSize: 5
        })
      })
  })
})
