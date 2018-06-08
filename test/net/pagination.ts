import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'tman'
import { SDKFetch } from '..'
import * as page from '../../src/Net/Pagination'

const fetchMock = require('fetch-mock')

describe.only('Pagination Spec', () => {
  const urlPath = 'task'

  it(`${page.defaultState.name} should be immutable`, () => {
    const app1Changes = page.defaultState(urlPath)
    const app2remains = page.defaultState(urlPath)
    Object.assign(app1Changes, { paginationUrlPath: 'event' })
    Object.assign(app1Changes, { additional: 'info' })
    expect(app2remains).to.deep.equal(page.defaultState(urlPath))
  })

  it(`${page.defaultState.name} should allow namespacing`, () => {
    const nested = page.defaultState(urlPath, 'nested')
    expect(nested.nested).to.deep.equal(page.defaultState(urlPath))
  })

  it(`${page.defaultState.name} should allow namespaced state to include extra custom states`, () => {
    const nested = page.defaultState(urlPath, 'nested', { page: 1 })
    expect(nested.nested).to.deep.equal({ ...page.defaultState(urlPath), page: 1 })
  })

  it(`${page.getState.name} should get pagination state from current app state`, () => {
    const pageState: page.State = {
      ...page.defaultState(urlPath),
      paginationNextPageToken: 'aslkdjfas' as page.PageToken,
      paginationTotalSize: 123,
      paginationResult: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    }
    const appState = { ...pageState, name: 'integers', oddOnes: [1, 3, 5, 7, 9] }
    expect(page.getState(appState)).to.deep.equal(pageState)
  })

  describe(`${page.nextPage.name}`, () => {
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

      const initial = page.defaultState(urlPath)
      return page
        .nextPage(sdkFetch, initial, 5)
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

      const initial = page.defaultState(urlPath)
      return page
        .nextPage(sdkFetch, initial, 5)
        .toPromise()
        .then((resultState) => {
          expect(resultState).to.deep.equal({
            paginationUrlPath: urlPath,
            paginationNextPageToken: 'asdf',
            paginationTotalSize: 66,
            paginationResult: [1, 2, 3, 4, 5]
          })
        })
    })

    it('should emit new state (based on non-initial state) on successful request', () => {
      fetchMock.get(new RegExp(testUrl), {
        nextPageToken: 'ghjk',
        totalSize: 66,
        result: [6, 7, 8, 9, 10]
      })

      const currState = {
        paginationUrlPath: urlPath,
        paginationNextPageToken: 'asdf' as page.PageToken,
        paginationTotalSize: 66,
        paginationResult: [1, 2, 3, 4, 5]
      }
      return page
        .nextPage(sdkFetch, currState, 5)
        .toPromise()
        .then((resultState) => {
          expect(resultState).to.deep.equal({
            paginationUrlPath: urlPath,
            paginationNextPageToken: 'ghjk',
            paginationTotalSize: 66,
            paginationResult: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          })
        })
    })

    it('should allow mapFn to be applied to all the items in result', () => {
      fetchMock.get(new RegExp(testUrl), {
        nextPageToken: 'ghjk',
        totalSize: 66,
        result: [6, 7, 8, 9, 10]
      })

      const currState = {
        paginationUrlPath: urlPath,
        paginationNextPageToken: 'asdf' as page.PageToken,
        paginationTotalSize: 66,
        paginationResult: [0, 1, 2, 3, 4]
      }
      return page
        .nextPage<number>(sdkFetch, currState, 5, {}, (i) => i - 1)
        .toPromise()
        .then((resultState) => {
          expect(resultState).to.deep.equal({
            paginationUrlPath: urlPath,
            paginationNextPageToken: 'ghjk',
            paginationTotalSize: 66,
            paginationResult: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
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

      const currState = {
        paginationUrlPath: urlPath,
        paginationNextPageToken: 'asdf' as page.PageToken,
        paginationTotalSize: 66,
        paginationResult: [
          { value: 0, sessionId: '20180607' },
          { value: 1, sessionId: '20180607' },
          { value: 2, sessionId: '20180607' },
          { value: 3, sessionId: '20180607' },
          { value: 4, sessionId: '20180607' },
        ]
      }
      return page
        .nextPage<number, { value: number, sessionId: string }>(
          sdkFetch,
          currState,
          5,
          {},
          (i, _1, _2, headers) => ({
            value: i - 1,
            sessionId: headers['x-request-id'] as string
          })
        )
        .toPromise()
        .then((resultState) => {
          expect(resultState).to.deep.equal({
            paginationUrlPath: urlPath,
            paginationNextPageToken: 'ghjk',
            paginationTotalSize: 66,
            paginationResult: [
              { value: 0, sessionId: '20180607' },
              { value: 1, sessionId: '20180607' },
              { value: 2, sessionId: '20180607' },
              { value: 3, sessionId: '20180607' },
              { value: 4, sessionId: '20180607' },
              { value: 5, sessionId: '20180608' },
              { value: 6, sessionId: '20180608' },
              { value: 7, sessionId: '20180608' },
              { value: 8, sessionId: '20180608' },
              { value: 9, sessionId: '20180608' }]
          })
        })
    })
  })

})
