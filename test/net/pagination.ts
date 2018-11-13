import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'tman'
import { Observable, Scheduler } from 'rxjs'
import { SDKFetch } from '..'
import * as page from '../../src/Net/Pagination'
import { expandPage } from '../../src/apis/pagination'

const fetchMock = require('fetch-mock')
const querystring = require('querystring')

describe('Pagination Spec', () => {
  const urlPath = 'task'
  const pageSize = 3
  const sampleResponse = {
    result: [1, 2, 3],
    nextPageToken: '456' as page.PageToken
  }

  describe(`${page.defaultState.name}()`, () => {
    it(`should be immutable`, () => {
      const app1Changes = page.defaultState(urlPath)
      const app2remains = page.defaultState(urlPath)
      Object.assign(app1Changes, { paginationUrlPath: 'event' })
      Object.assign(app1Changes, { additional: 'info' })
      expect(app2remains).to.deep.equal(page.defaultState(urlPath))
    })

    it(`should default to kind '${page.Kind.PageToken}'`, () => {
      expect(page.defaultState(urlPath).kind).to.equal(page.Kind.PageToken)
    })

    it(`should allow options: kind`, () => {
      expect(page.defaultState(urlPath, { kind: page.Kind.PageCount }).kind).to.equal(page.Kind.PageCount)
      expect(page.defaultState(urlPath, { kind: page.Kind.PageToken }).kind).to.equal(page.Kind.PageToken)
    })

    it(`should allow options: pageSize`, () => {
      expect(page.defaultState(urlPath, { pageSize: 11 }).pageSize).to.equal(11)
    })

    it(`should allow options: urlQuery`, () => {
      expect(page.defaultState(urlPath, { urlQuery: {} }).urlQuery).to.deep.equal({})
      expect(page.defaultState(urlPath, { urlQuery: { q: 'haha' } }).urlQuery).to.deep.equal({ q: 'haha' })
    })

    it(`should allow pageSize be specified in options.urlQuery`, () => {
      expect(page.defaultState(urlPath, { urlQuery: { pageSize: 11 } }).pageSize).to.equal(11)
      expect(page.defaultState(urlPath, { pageSize: 11, urlQuery: { pageSize: 22 } }).pageSize).to.equal(11)
    })

    it(`should produce expected state shape for each kind`, () => {
      const expectedKindAState = {
        kind: page.Kind.PageCount,
        urlPath,
        result: [],
        nextPage: 1,
        hasMore: true,
        urlQuery: undefined,
        pageSize: 50,
        limit: 0
      }
      const expectedKindBState = {
        kind: page.Kind.PageToken,
        urlPath,
        result: [],
        nextPage: 1,
        hasMore: true,
        urlQuery: undefined,
        pageSize: 50,
        limit: 0,
        nextPageToken: page.emptyPageToken,
        totalSize: undefined
      }
      expect(page.defaultState(urlPath, { kind: page.Kind.PageCount })).to.deep.equal(expectedKindAState)
      expect(page.defaultState(urlPath)).to.deep.equal(expectedKindBState)
      expect(page.defaultState(urlPath, { kind: page.Kind.PageToken })).to.deep.equal(expectedKindBState)
    })
  })

  describe(`${page.expand.name}(`, () => {
    it(`should complete on source$ completion`, function* () {
      const source$ = Observable.empty()
      const expandOp = page.expand(
        () => Observable.of(sampleResponse),
        page.acc,
        page.defaultState<number>('')
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

    it(`should complete on hasMore: false`, function* () {
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
        page.acc,
        page.defaultState<number>('')
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

    it(`should error on source$ error`, function* () {
      const sampleError = new Error('source$ error')
      const source$ = Observable.throw(sampleError)
      const expandOp = page.expand(
        () => Observable.of(sampleResponse),
        page.acc,
        page.defaultState<number>('')
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

    it(`should allow retry on source$ error`, function* () {
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
        page.acc,
        page.defaultState<number>('')
      )
      yield source$.pipe(expandOp).mergeAll().do((x) => {
        expect(x.nextPageToken).to.equal('456')
        expect(x.result.slice(-pageSize)).to.deep.equal([1, 2, 3])
      }).retry(2)
    })

    // todo(dingwen): use marble test instead
    it(`should ignore source$ when the current load is yet to be completed`, function* () {
      const source$ = Observable.interval(10).take(3)
      const expandOp = page.expand(
        () => Observable.of(sampleResponse).delay(25),
        page.acc,
        page.defaultState<number>('')
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

    it(`should not block second load when the first load has failed`, function* () {
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
        page.acc,
        page.defaultState<number>('')
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

    it(`should not block next load when current load has failed`, function* () {
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
        page.acc,
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
})

describe(`${expandPage.name}`, () => {
  let sdkFetch: SDKFetch
  const apiHost = 'https://www.teambition.com/api'
  const urlPath = 'task'
  const testUrl = `${apiHost}/${urlPath}`
  const pageSize = 5
  const initStateA = Object.freeze(page.defaultState(urlPath, { pageSize, kind: page.Kind.PageCount }))
  const initStateB = Object.freeze(page.defaultState(urlPath, { pageSize, kind: page.Kind.PageToken }))
  const initStates = [initStateA, initStateB]

  beforeEach(() => {
    sdkFetch = new SDKFetch(apiHost)
  })

  afterEach(() => {
    fetchMock.restore()
  })

  initStates.forEach((state) => {
    it(`state kind ${state.kind}: should not emit new state when request fails`, () => {
      fetchMock.get(new RegExp(testUrl), { status: 404 })

      return sdkFetch.expandPage(state)
        .toPromise()
        .then(() => {
          throw new Error('should not emit new state when request fails')
        })
        .catch((err) => {
          expect(err.error.status).to.equal(404)
        })
    })
  })

  it(`state kind ${page.Kind.PageCount}: should emit new state (based on initial state) on successful request`, () => {
    fetchMock.get(new RegExp(testUrl), [1, 2, 3, 4, 5])

    return sdkFetch.expandPage(initStateA)
      .take(1)
      .toPromise()
      .then((resultState) => {
        expect(resultState).to.deep.equal({
          kind: page.Kind.PageCount,
          urlPath,
          result: [1, 2, 3, 4, 5],
          nextPage: 2,
          hasMore: true,
          pageSize: 5,
          urlQuery: undefined,
          limit: 5
        })
      })
  })

  it(`state kind ${page.Kind.PageToken}: should emit new state (based on initial state) on successful request`, () => {
    fetchMock.get(new RegExp(testUrl), {
      nextPageToken: 'asdf',
      totalSize: 66,
      result: [1, 2, 3, 4, 5]
    })

    return sdkFetch.expandPage(initStateB)
      .take(1)
      .toPromise()
      .then((resultState) => {
        expect(resultState).to.deep.equal({
          kind: page.Kind.PageToken,
          urlPath,
          nextPageToken: 'asdf',
          totalSize: 66,
          result: [1, 2, 3, 4, 5],
          nextPage: 2,
          hasMore: true,
          pageSize: 5,
          urlQuery: undefined,
          limit: 5
        })
      })
  })

  it(`state kind ${page.Kind.PageCount}: should emit new state (based on non-initial state) on successful request`, () => {
    fetchMock.get(new RegExp(testUrl), [6, 7, 8, 9, 10])

    const currState: page.PageCountState = {
      kind: page.Kind.PageCount,
      urlPath,
      result: [1, 2, 3, 4, 5],
      nextPage: 2,
      hasMore: true,
      pageSize: 5,
      limit: 5,
      urlQuery: undefined
    }
    return sdkFetch.expandPage(currState)
      .take(1)
      .toPromise()
      .then((resultState) => {
        expect(resultState).to.deep.equal({
          kind: page.Kind.PageCount,
          urlPath: urlPath,
          result: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          nextPage: 3,
          hasMore: true,
          pageSize: 5,
          urlQuery: undefined,
          limit: 10
        })
      })
  })

  it(`state kind ${page.Kind.PageToken}: should emit new state (based on non-initial state) on successful request`, () => {
    fetchMock.get(new RegExp(testUrl), {
      nextPageToken: 'ghjk',
      totalSize: 66,
      result: [6, 7, 8, 9, 10]
    })

    const currState: page.PageTokenState = {
      kind: page.Kind.PageToken,
      urlPath,
      nextPageToken: 'asdf' as page.PageToken,
      totalSize: 66,
      result: [1, 2, 3, 4, 5],
      nextPage: 2,
      hasMore: true,
      pageSize: 5,
      limit: 5,
      urlQuery: undefined
    }
    return sdkFetch.expandPage(currState)
      .take(1)
      .toPromise()
      .then((resultState) => {
        expect(resultState).to.deep.equal({
          kind: page.Kind.PageToken,
          urlPath: urlPath,
          nextPageToken: 'ghjk',
          totalSize: 66,
          result: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          nextPage: 3,
          hasMore: true,
          pageSize: 5,
          urlQuery: undefined,
          limit: 10
        })
      })
  })

  it(`state kind ${page.Kind.PageCount}: should expand on options.loadMore$`, function* () {
    fetchMock.get(new RegExp(testUrl), (url, options) => {
      const pageNums = ['1', '2', '3']
      const i = url.indexOf('?')
      const qs = url.slice(i + 1)
      const q = querystring.parse(qs)
      const page = pageNums.indexOf(q.page)
      const step = page * pageSize
      return [1,2,3,4,5].map((x) => x + step)
    })

    const stream$ = sdkFetch.expandPage(initStateA, {
      loadMore$: Observable.from(['page 1', 'page 2', 'page 3'])
    })

    yield stream$.take(1)
      .do((x) => {
        expect(x.nextPage).to.equal(2)
        expect(x.result).to.deep.equal([1, 2, 3, 4, 5])
      })

    yield stream$.take(1)
      .do((x) => {
        expect(x.nextPage).to.equal(3)
        expect(x.result).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      })

    yield stream$.take(1)
      .do((x) => {
        expect(x.nextPage).to.equal(4)
        expect(x.result).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
      })
  })

  it(`state kind ${page.Kind.PageToken}: should expand on options.loadMore$`, function* () {
    fetchMock.get(new RegExp(testUrl), (url, options) => {
      const pageTokens = ['', 'a', 'b', 'c']
      const i = url.indexOf('?')
      const qs = url.slice(i + 1)
      const q = querystring.parse(qs)
      const page = pageTokens.indexOf(q.pageToken)
      const step = page * pageSize
      return {
        nextPageToken: pageTokens[page + 1],
        result: [1,2,3,4,5].map((x) => x + step)
      }
    })

    const stream$ = sdkFetch.expandPage(initStateB, {
      loadMore$: Observable.from(['page 1', 'page 2', 'page 3'])
    })

    yield stream$.take(1)
      .do((x) => {
        expect(x.nextPage).to.equal(2)
        expect(x.result).to.deep.equal([1, 2, 3, 4, 5])
        expect(x.nextPageToken).to.equal('a')
      })

    yield stream$.take(1)
      .do((x) => {
        expect(x.nextPage).to.equal(3)
        expect(x.result).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        expect(x.nextPageToken).to.equal('b')
      })

    yield stream$.take(1)
      .do((x) => {
        expect(x.nextPage).to.equal(4)
        expect(x.result).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
        expect(x.nextPageToken).to.equal('c')
      })
  })

  it(`state kind ${page.Kind.PageCount}: should disable default concat behavior on options.doNotConcat: true`, () => {
    fetchMock.get(new RegExp(testUrl), [6, 7, 8, 9, 10])

    const currState: page.PageCountState = {
      kind: page.Kind.PageCount,
      urlPath,
      result: [1, 2, 3, 4, 5],
      nextPage: 2,
      hasMore: true,
      pageSize: 5,
      limit: 5,
      urlQuery: undefined
    }
    return sdkFetch.expandPage(currState, { skipConcat: true })
      .take(1)
      .toPromise()
      .then((resultState) => {
        expect(resultState.result).to.deep.equal([6, 7, 8, 9, 10])
        expect(resultState.limit).to.equal(10)
        expect(resultState.nextPage).to.equal(3)
        expect(resultState.hasMore).to.be.true
      })
  })

  it(`state kind ${page.Kind.PageToken}: should disable default concat behavior on options.doNotConcat: true`, () => {
    fetchMock.get(new RegExp(testUrl), {
      nextPageToken: 'ghjk',
      totalSize: 66,
      result: [6, 7, 8, 9, 10]
    })

    const currState: page.PageTokenState = {
      kind: page.Kind.PageToken,
      urlPath,
      nextPageToken: 'asdf' as page.PageToken,
      totalSize: 66,
      result: [1, 2, 3, 4, 5],
      nextPage: 2,
      hasMore: true,
      pageSize: 5,
      limit: 5,
      urlQuery: undefined
    }
    return sdkFetch.expandPage(currState, { skipConcat: true })
      .take(1)
      .toPromise()
      .then((resultState) => {
        expect(resultState.result).to.deep.equal([6, 7, 8, 9, 10])
        expect(resultState.limit).to.equal(10)
        expect(resultState.nextPage).to.equal(3)
        expect(resultState.hasMore).to.be.true
      })
  })

  it(`state kind ${page.Kind.PageCount}: should mutate state on successful request on options.mutate: true`, () => {
    fetchMock.get(new RegExp(testUrl), [1, 2, 3, 4])
    const initial = { ...initStateA }
    return sdkFetch.expandPage(initial, { mutate: true })
      .take(1)
      .toPromise()
      .then(() => {
        expect(initial.nextPage).to.equal(2)
        expect(initial.result).to.deep.equal([1, 2, 3, 4])
        expect(initial.hasMore).to.be.false
      })
  })

  it(`state kind ${page.Kind.PageToken}: should mutate state on successful request on options.mutate: true`, () => {
    fetchMock.get(new RegExp(testUrl), {
      nextPageToken: 'asdf',
      totalSize: 4,
      result: [1, 2, 3, 4]
    })
    const initial = { ...initStateB }
    return sdkFetch.expandPage(initial, { mutate: true })
      .take(1)
      .toPromise()
      .then(() => {
        expect(initial.nextPageToken).to.equal('asdf')
        expect(initial.totalSize).to.equal(4)
        expect(initial.nextPage).to.equal(2)
        expect(initial.result).to.deep.equal([1, 2, 3, 4])
        expect(initial.hasMore).to.be.false
      })
  })

  it(`state kind ${page.Kind.PageCount}: should allow mapFn to be applied to all the items in result`, () => {
    fetchMock.get(new RegExp(testUrl), [6, 7, 8, 9, 10])

    const currState: page.PageCountState<number> = {
      kind: page.Kind.PageCount,
      urlPath,
      result: [0, 1, 2, 3, 4],
      nextPage: 2,
      hasMore: true,
      pageSize: 5,
      limit: 5
    }
    return sdkFetch.expandPage<number>(currState, {
      urlQuery: {},
      mapFn: (i) => i - 1
    })
      .take(1)
      .toPromise()
      .then((resultState) => {
        expect(resultState.result).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      })
  })

  it(`state kind ${page.Kind.PageToken}: should allow mapFn to be applied to all the items in result`, () => {
    fetchMock.get(new RegExp(testUrl), {
      nextPageToken: 'ghjk',
      totalSize: 66,
      result: [6, 7, 8, 9, 10]
    })

    const currState: page.PageTokenState<number> = {
      kind: page.Kind.PageToken,
      urlPath,
      nextPageToken: 'asdf' as page.PageToken,
      totalSize: 66,
      result: [0, 1, 2, 3, 4],
      nextPage: 2,
      hasMore: true,
      pageSize: 5,
      limit: 5
    }
    return sdkFetch.expandPage<number>(currState, {
      urlQuery: {},
      mapFn: (i) => i - 1
    })
      .take(1)
      .toPromise()
      .then((resultState) => {
        expect(resultState.result).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
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

    const currState: page.PageTokenState<{ value: number, sessionId: string }> = {
      kind: page.Kind.PageToken,
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
      pageSize: 5,
      limit: 5
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
          kind: page.Kind.PageToken,
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
          pageSize: 5,
          limit: 10
        })
      })
  })

  it(`should 'pass-through' state of undefined kind`, () => {
    fetchMock.get(new RegExp(testUrl), [1, 2, 3, 4, 5])

    const { kind, ...initial } = initStateA

    return sdkFetch.expandPage(initial as any)
      .take(1)
      .toPromise()
      .then((x) => {
        expect(x).to.deep.equal(initial)
      })
  })

  it(`should support pattern of converging multiple dynamically added/removed streams`, function* () {
    fetchMock.get(new RegExp('even'), (url, options) => {
      const pageTokens = ['', 'a', 'b']
      const i = url.indexOf('?')
      const qs = url.slice(i + 1)
      const q = querystring.parse(qs)
      const page = pageTokens.indexOf(q.pageToken)
      const step = page * pageSize * 2
      return {
        nextPageToken: pageTokens[page + 1],
        result: [0, 2, 4, 6, 8].map((x) => x + step)
      }
    })

    fetchMock.get(new RegExp('odd'), (url, options) => {
      const pageTokens = ['', 'a', 'b', 'c']
      const i = url.indexOf('?')
      const qs = url.slice(i + 1)
      const q = querystring.parse(qs)
      const page = pageTokens.indexOf(q.pageToken)
      const step = page * pageSize * 2
      return {
        nextPageToken: pageTokens[page + 1],
        result: [1, 3, 5, 7, 9].map((x) => x + step)
      }
    })

    const store = {
      numbers: [] as number[],
      hasMore: {
        even: true,
        odd: true
      }
    }
    const loadedReducer = (s: typeof store, payload: any): typeof store => {
      const hasMore = { ...s.hasMore, ...payload.hasMore }
      return {
        ...s,
        numbers: payload.numbers,
        hasMore
      }
    }
    const source$ = Observable.from([
      { kind: 'even', signal: 'initial load' },
      { kind: 'odd', signal: 'initial load' },
      { kind: 'even', signal: 'load more' },
      { kind: 'odd', signal: 'load more' },
      { kind: 'odd', signal: 'load more' },
      { kind: 'odd', signal: 'load more' },
      { kind: 'even', signal: 'load more' },
      { kind: 'even', signal: 'destory' },
      { kind: 'odd', signal: 'load more' },
      { kind: 'odd', signal: 'destroy' }
    ], Scheduler.async).publishReplay(1).refCount()

    const result$ = source$
      .groupBy(({ kind }) => kind, undefined, (grouped$) => {
        const key = grouped$.key
        return source$.filter(({ kind, signal }) => kind === key && signal === 'destroy')
      })
      .mergeMap((grouped$) => {
        const key = grouped$.key
        const init: page.PageTokenState<number> = { ...initStateB, urlPath: key, result: [] }
        const firstPage$ = grouped$.filter(({ signal }) => signal === 'initial load')
        const restPages$ = grouped$.filter(({ signal }) => signal === 'load more')

        return firstPage$.switchMap(() => {
          return sdkFetch.expandPage(init, { loadMore$: restPages$ })
            .map(({ result, hasMore }) => {
              return { result, hasMore, kind: key }
            })
        })
      })
      .scan((ret, x) => {
        return ret.set(x.kind, { hasMore: x.hasMore, result: x.result })
      }, new Map<string, { hasMore: boolean, result: number[] }>())
      .map((m) => {
        let numbers: number[] = []
        const hasMoreX = {}
        for (const [ key, { hasMore, result } ] of m.entries()) {
          numbers = numbers.concat(result)
          hasMoreX[key] = hasMore
        }
        return { numbers: numbers.sort((a, b) => a - b), hasMore: hasMoreX }
      })
      .scan(loadedReducer, store)
      // .take(10)
      .toArray()

    yield result$.take(1)
      .do((x) => {
        expect(x).to.deep.equal([
          {
            numbers: [0, 2, 4, 6, 8],
            hasMore: { even: true, odd: true }
          },
          {
            numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            hasMore: { even: true, odd: true }
          },
          {
            numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18],
            hasMore: { even: true, odd: true }
          },
          {
            numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
            hasMore: { even: true, odd: true }
          },
          {
            numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 23, 25, 27, 29],
            hasMore: { even: true, odd: true }
          },
          {
            numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39],
            hasMore: { even: true, odd: false }
          },
          {
            numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 33, 35, 37, 39],
            hasMore: { even: false, odd: false }
          }])
      })
  })
})
