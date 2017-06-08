import { Observable } from 'rxjs'
import { expect } from 'chai'
import { describe, it, beforeEach } from 'tman'

import { HttpErrorMessage, forEach, Http } from '../index'

const fetchMock = require('fetch-mock')

export default describe('net/http', () => {

  let fetchInstance: Http<any>
  let url: string
  const path = 'test'

  beforeEach(() => {
    fetchInstance = new Http
    url = `${fetchInstance.getAPIHost()}/${path}`
  })

  it('should configure api host', () => {
    expect(fetchInstance.getAPIHost()).to.equal('https://www.teambition.com/api')
    const myUrl = 'https://www.example.com'
    fetchInstance.setAPIHost(myUrl)
    expect(fetchInstance.getAPIHost()).to.equal(myUrl)
  })

  it('should call isomophic fetch with the correct arguments', done => {
    const data = { test: 'test' }
    fetchMock.mock(url, data)
    fetchInstance.get(path).send()
      .subscribe(() => {
        expect(fetchMock.calls().matched.length).to.equal(1)
        expect(fetchMock.lastUrl()).to.equal(url)
        expect(fetchMock.lastOptions()).to.deep.equal({
          method: 'get',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
        fetchMock.restore()
        done()
      })
  })

  it('should serialize array to query string', () => {
    const query = { a: 'a', b: [1, 2, 'b', 'b'], c: 3 }
    const parts: string[] = []
    forEach(query, (value, key) => {
      if (!Array.isArray(value)) {
        value = <any>[value]
      }
      parts.push(...(<any[]>value).map(v => `${key}=${v}`))
    })
    const actual = fetchInstance['_buildQuery']('', query)
    const expected = `?${parts.join('&')}`
    expect(actual).to.be.equal(expected)
  })

  it('should serialize query with queryUrl to query string', () => {
    const query = { a: 'a', b: [1, 2, 'b', 'b'], c: 3 }
    const parts: string[] = []
    forEach(query, (value, key) => {
      if (!Array.isArray(value)) {
        value = <any>[value]
      }
      parts.push(...(<any[]>value).map(v => `${key}=${v}`))
    })
    const actual = fetchInstance['_buildQuery']('http://abc.com?_=123', query)
    const expected = `http://abc.com?_=123&${parts.join('&')}`
    expect(actual).to.be.equal(expected)
  })

  it('should set headers', done => {
    const header = { 'X-Request-Id': '2333' }
    fetchInstance.setHeaders(header)
    fetchMock.mock(url, {})
    fetchInstance.get(path)
      .send()
      .subscribe(() => {
        expect(fetchMock.lastOptions()).to.deep.equal({
          method: 'get',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Request-Id': '2333'
          },
          credentials: 'include'
        })
        fetchMock.restore()
        fetchInstance.restore()
        done()
      })
  })

  it('should set token', done => {
    const token = 'test_token'
    fetchInstance.setToken(token)
    fetchMock.mock(url, {})
    fetchInstance.get(path)
      .send()
      .subscribe(() => {
        expect(fetchMock.lastOptions()).to.deep.equal({
          method: 'get',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `OAuth2 ${token}`
          }
        })
        fetchMock.restore()
        fetchInstance.restore()
        done()
      })
  });

  ['get', 'post', 'put', 'delete'].forEach(httpMethod => {
    it(`should define ${httpMethod}`, done => {
      const responseData = { test: 'test' }
      const body = { body: 'body' }
      fetchMock.mock(url, JSON.stringify(responseData), {
        method: httpMethod
      })
      fetchInstance[httpMethod](path, httpMethod === 'get' || httpMethod === 'delete' ? null : body)
        .send()
        .subscribe((res: any) => {
          expect(fetchMock.lastOptions().method).to.equal(httpMethod)
          expect(res).to.deep.equal(responseData)
          if (httpMethod === 'put' || httpMethod === 'post') {
            expect(JSON.parse(fetchMock.lastOptions().body)).to.deep.equal(body)
          }
          fetchMock.restore()
          done()
        })
    })
  });

  ['get', 'post', 'put', 'delete'].forEach(httpMethod => {
    it(`${httpMethod} Result should contain requestId when request headers has X-Request-Id`, done => {
      const responseData = { test: 'test' }
      const body = { body: 'body' }
      fetchMock.mock(url, {
        body: JSON.stringify(responseData),
        headers: {
          'X-Request-Id': '2333'
        }
      }, {
        method: httpMethod
      })
      fetchInstance.setHeaders({ 'X-Request-Id': '2333' })
      fetchInstance[httpMethod](path, httpMethod === 'get' || httpMethod === 'delete' ? null : body)
        .send()
        .subscribe((res: any) => {
          expect(res).to.deep.equal({ ...responseData, requestId: '2333' })
          fetchMock.restore()
          fetchInstance.restore()
          done()
        })
    })
  });

  ['get', 'post', 'put', 'delete'].forEach(httpMethod => {
    [400, 401, 403, 404, 500].forEach(status => {
      it(`should handle ${status} status for ${httpMethod}`, done => {
        const responseData = { body: { test: 'test' }, method: httpMethod, status }
        const body = { body: 'body' }
        fetchMock.mock(url, responseData )
        fetchInstance[httpMethod](path, httpMethod === 'get' ? null : body)
          .send()
          .do((res: Response) => {
            expect(res).not.to.deep.equal(responseData.body)
            done()
          })
          .catch((res: HttpErrorMessage) => {
            if (fetchMock.lastOptions()) {
              expect(fetchMock.lastOptions().method).to.equal(httpMethod)
            }
            expect(res.error.status).to.deep.equal(status)
            fetchMock.restore()
            done()
            return Observable.empty()
          })
          .subscribe()
      })
    })
  })
})
