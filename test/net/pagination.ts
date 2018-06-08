import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'tman'
import { SDKFetch } from '..'
import * as page from '../../src/Net/Pagination'
import { next } from '../../src/apis/pagination'

const fetchMock = require('fetch-mock')

describe('Pagination Spec', () => {
  const urlPath = 'task'

  it(`${page.defaultState.name} should be immutable`, () => {
    const app1Changes = page.defaultState(urlPath)
    const app2remains = page.defaultState(urlPath)
    Object.assign(app1Changes, { paginationUrlPath: 'event' })
    Object.assign(app1Changes, { additional: 'info' })
    expect(app2remains).to.deep.equal(page.defaultState(urlPath))
  })

  describe(`${next.name}`, () => {
    let sdkFetch: SDKFetch
    const apiHost = 'https://www.teambition.com/api'
    const testUrl = `${apiHost}/${urlPath}`

    beforeEach(() => {
      sdkFetch = new SDKFetch(apiHost)
    })

    afterEach(() => {
      fetchMock.restore()
    })

    it('should not emit new state when request fails', () => {
      fetchMock.get(new RegExp(testUrl), {
        status: 404,
        throws: 'paging fails'
      })

      const initial = page.defaultState(urlPath, { pageSize: 5 })
      return sdkFetch.nextPage(initial)
        .toPromise()
        .then(() => {
          throw new Error('should not emit new state when request fails')
        })
        .catch((err) => {
          expect(err.error).to.equal('paging fails')
        })
    })

    it('should emit new state (based on initial state) on successful request', () => {
      fetchMock.get(new RegExp(testUrl), {
        nextPageToken: 'asdf',
        totalSize: 66,
        result: [1, 2, 3, 4, 5]
      })

      const initial = page.defaultState(urlPath, { pageSize: 5 })
      return sdkFetch.nextPage(initial)
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
        hasMore: true
      }
      return sdkFetch.nextPage(currState, { pageSize: 5 })
        .toPromise()
        .then((resultState) => {
          expect(resultState).to.deep.equal({
            urlPath: urlPath,
            nextPageToken: 'ghjk',
            totalSize: 66,
            result: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            nextPage: 3,
            hasMore: true
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
        hasMore: true
      }
      return sdkFetch.nextPage<number>(currState, {
        pageSize: 5,
        urlQuery: {},
        mapFn: (i) => i - 1
      })
        .toPromise()
        .then((resultState) => {
          expect(resultState).to.deep.equal({
            urlPath,
            nextPageToken: 'ghjk',
            totalSize: 66,
            result: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            nextPage: 3,
            hasMore: true
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
        hasMore: true
      }
      return sdkFetch.nextPage<number, { value: number, sessionId: string }>(
        currState,
        {
          pageSize: 5,
          urlQuery: {},
          mapFn: (i, _1, _2, headers) => ({
            value: i - 1,
            sessionId: headers['x-request-id'] as string
          })
        }
      )
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
            hasMore: true
          })
        })
    })
  })

})
