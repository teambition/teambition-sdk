import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'tman'
import { asapScheduler, empty, forkJoin, from, of, zip, Observable, Subject } from 'rxjs'
import { catchError, flatMap, subscribeOn, tap } from 'rxjs/operators'

import { HttpErrorMessage, Http } from '../index'
import { tapAsap } from '../utils'
import * as http from '../../src/Net/Http'

const fetchMock = require('fetch-mock')

export default describe('net/http', () => {

  let fetchInstance: Http<any>
  let url: string
  const apiHost = 'https://www.teambition.com/api'
  const path = 'test'
  const allowedMethods = ['get', 'post', 'put', 'delete']

  beforeEach(() => {
    url = `${apiHost}/${path}`
    fetchInstance = new Http(url)
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('should call isomophic fetch with the correct arguments', function* () {
    const data = { test: 'test' }
    fetchMock.mock(url, data)
    yield fetchInstance.get().send()
      .pipe(tapAsap(() => {
        expect(fetchMock.calls().matched.length).to.equal(1)
        expect(fetchMock.lastUrl()).to.equal(url)
        expect(fetchMock.lastOptions()).to.deep.equal({
          method: 'get',
          headers: {},
          credentials: 'include'
        })
      }))
  })

  it('should set headers', function* () {
    const header = { 'X-Request-Id': '2333' }
    fetchInstance.setHeaders(header)
    fetchMock.mock(url, {})
    yield fetchInstance.get()
      .send()
      .pipe(tapAsap(() => {
        expect(fetchMock.lastOptions()).to.deep.equal({
          method: 'get',
          headers: {
            'X-Request-Id': '2333'
          },
          credentials: 'include'
        })
      }))
  })

  it('should set headers with copy of the input headers', function* () {
    const headers = {}

    fetchInstance.setHeaders(headers)

    // 如果使用的是传入 headers 对象的引用，下面修改会导致最终 headers 被修改
    headers['X-Request-Id'] = '2333'

    fetchMock.mock(url, {})
    yield fetchInstance.get()
      .send()
      .pipe(tapAsap(() => {
        expect(fetchMock.lastOptions().headers).to.deep.equal({})
      }))
  })

  it('should set token', function* () {
    const token = 'test_token'
    fetchInstance.setToken(token)
    fetchMock.mock(url, {})
    yield fetchInstance.get()
      .send()
      .pipe(tapAsap(() => {
        expect(fetchMock.lastOptions()).to.deep.equal({
          method: 'get',
          headers: {
            'Authorization': `OAuth2 ${token}`
          }
        })
      }))
  })

  allowedMethods.forEach(httpMethod => {
    it(`should define ${httpMethod}`, function* () {
      const responseData = { test: 'test' }
      const body = { body: 'body' }
      fetchMock.mock(url, JSON.stringify(responseData), {
        method: httpMethod
      })

      yield fetchInstance[httpMethod](httpMethod === 'get' || httpMethod === 'delete' ? null : body)
        .send()
        .pipe(tapAsap((res: any) => {
          expect(fetchMock.lastOptions().method).to.equal(httpMethod)
          expect(res).to.deep.equal(responseData)
          if (httpMethod === 'put' || httpMethod === 'post') {
            expect(fetchMock.lastOptions().body).to.deep.equal(body)
          }
        }))
    })
  })

  it('delete() should support carrying request body', function* () {
      const responseData = { test: 'test' }
      const body = { body: 'body' }
      fetchMock.mock(url, JSON.stringify(responseData), {
        method: 'delete'
      })

      yield fetchInstance.delete(body)
        .send()
        .pipe(tapAsap((res: any) => {
          expect(fetchMock.lastOptions().method).to.equal('delete')
          expect(fetchMock.lastOptions().body).to.deep.equal(body)
          expect(res).to.deep.equal(responseData)
        }))
    })

  allowedMethods.forEach(httpMethod => {
    it(`${httpMethod} Result should be able to include response headers`, function* () {
      const responseData = { test: 'test' }
      const body = { body: 'body' }
      const sampleValue = '2333'
      fetchMock.mock(url, {
        body: JSON.stringify(responseData),
        headers: {
          'X-Request-Id': sampleValue
        }
      }, {
        method: httpMethod
      })

      const fetchInstance2 = http.getHttpWithResponseHeaders(url)
      fetchInstance2.setHeaders({ 'X-Request-Id': sampleValue })

      yield fetchInstance2[httpMethod](path, httpMethod === 'get' || httpMethod === 'delete' ? null : body)
        .send()
        .pipe(tapAsap((resp: any) => {
          expect(resp.body).to.deep.equal(responseData)
          expect(resp.headers.get('x-request-id')).to.equal(sampleValue)
        }))
    })
  })

  allowedMethods.forEach(httpMethod => {
    [400, 401, 403, 404, 500].forEach(status => {
      it(`should handle ${status} status for ${httpMethod}`, function* () {
        const responseData = { body: { test: 'test' }, method: httpMethod, status }
        const body = { body: 'body' }
        fetchMock.mock(url, responseData )
        yield (fetchInstance[httpMethod](path, httpMethod === 'get' ? null : body) as Http<{}>)
          .send()
          .pipe(
            catchError((res: HttpErrorMessage) => {
              if (fetchMock.lastOptions()) {
                expect(fetchMock.lastOptions().method).to.equal(httpMethod)
              }
              expect(res.error.status).to.equal(status)
              expect(res.method).to.equal(httpMethod)
              expect(res.url).to.equal(url)
              return empty()
            }),
            subscribeOn(asapScheduler)
          )
      })
    })
  })

  it('should emit usable error: Response at both original$ and errorAdaptor$', function* () {
    const status = 429
    const body = { text: 'busy' }
    fetchMock.mock(url, { body, method: 'get', status })

    const errorAdaptor$ = new Subject<HttpErrorMessage>()
    const fetchInstance2 = new Http(url, errorAdaptor$)

    const caught$ = fetchInstance2.get()
      .send()
      .pipe(catchError((res: HttpErrorMessage) => of(res))) as Observable<HttpErrorMessage>

    yield zip(caught$, errorAdaptor$)
      .pipe(
        flatMap(([caught, adaptor]) => {
          return zip(
            from(caught.error.json()),
            from(adaptor.error.json())
          )
        }),
        tap(([caught, errorMsg]) => {
          expect(caught).to.deep.equal(body)
          expect(errorMsg).to.deep.equal(body)
        }),
        catchError(() => {
          expect('Should not reach here!').to.equal('')
          return empty()
        }),
        subscribeOn(asapScheduler)
      )
  })

  it('createMethod() should give response text when it cannot be parsed successfully', function* () {
    const letJSONparseThrow = '[1, 2, 3,]'
    fetchMock.getOnce(url, letJSONparseThrow)

    yield http.createMethod('get')({ url } as any)
      .pipe(tapAsap((x: any) => {
        expect(x).to.equal(letJSONparseThrow)
      }))
  })

  it('correctly clone-ed Http instance should use cached response', function* () {
    const expectedResp = { value: 'A' }

    fetchInstance.get()
    // 一个从源 Http 对象 clone 的对象
    const fetchInstanceClone1 = fetchInstance.clone()
    // 第二个从源 Http 对象 clone 的对象
    const fetchInstanceClone2 = fetchInstance.clone()
    // 一个从 clone 出来的 Http 对象 clone 的对象
    const fetchInstanceClone1Clone = fetchInstanceClone1.clone()

    fetchMock.get(url, { body: JSON.stringify(expectedResp) })

    yield forkJoin(
      fetchInstance.send(),
      fetchInstanceClone1.send(),
      fetchInstanceClone2.send(),
      fetchInstanceClone1Clone.send()
    )
    .pipe(tapAsap(([res, resClone1, resClone2, resClone1Clone]) => {
      expect(res).to.deep.equal(expectedResp)
      expect(resClone1).to.deep.equal(expectedResp)
      expect(resClone2).to.deep.equal(expectedResp)
      expect(resClone1Clone).to.deep.equal(expectedResp)
      expect(fetchMock.calls(url)).lengthOf(1)
    }))
  })
})
