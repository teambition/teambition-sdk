'use strict'
import { Observable } from 'rxjs'
import * as chai from 'chai'
import { Fetch, HttpErrorMessage, forEach } from '../index'
const fetchMock = require('fetch-mock')

const expect = chai.expect

export default describe('utils/fetch', () => {

  let fetchInstance: Fetch

  beforeEach(() => {
    fetchInstance = new Fetch()
  })

  it('should configure api host', () => {
    expect(fetchInstance.getAPIHost()).to.equal('https://www.teambition.com/api/')
    const url = 'https://www.example.com'
    fetchInstance.setAPIHost(url)
    expect(fetchInstance.getAPIHost()).to.equal(url)
  })

  it('should call isomophic fetch with the correct arguments', done => {
    const path = '/test'
    const url = `${fetchInstance.getAPIHost()}${path}`
    const data = {test: 'test'}
    fetchMock.mock(url, data)
    fetchInstance.get(path)
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
    const query = {a: 'a', b: [1, 2, 'b', 'b'], c: 3}
    const parts = []
    forEach(query, (value, key) => {
      if (!Array.isArray(value)) {
        value = <any>[value]
      }
      parts.push(...(<any[]>value).map(value => `${key}=${value}`))
    })
    const actual = fetchInstance['_buildQuery']('', query)
    const expected = `?${parts.join('&')}`
    expect(actual).to.be.equal(expected)
  })

  it('should serialize query with queryUrl to query string', () => {
    const query = {a: 'a', b: [1, 2, 'b', 'b'], c: 3}
    const parts = []
    forEach(query, (value, key) => {
      if (!Array.isArray(value)) {
        value = <any>[value]
      }
      parts.push(...(<any[]>value).map(value => `${key}=${value}`))
    })
    const actual = fetchInstance['_buildQuery']('http://abc.com?_=123', query)
    const expected = `http://abc.com?_=123&${parts.join('&')}`
    expect(actual).to.be.equal(expected)
  })

  it('should set token', done => {
    const token = 'test_token'
    const apiHost = 'https://www.teambition.com/api/'
    const path = 'test'
    const url = `${apiHost}${path}`
    fetchInstance.setToken(token)
    fetchMock.mock(url, {})
    fetchInstance.get(path)
      .subscribe((res) => {
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
      const path = 'test'
      const url = `${fetchInstance.getAPIHost()}${path}`
      const responseData = { test: 'test' }
      const body = { body: 'body' }
      fetchMock.mock(url, JSON.stringify(responseData), {
        method: httpMethod
      })
      fetchInstance[httpMethod](path, httpMethod === 'get' ? null : body)
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
    [400, 401, 403, 404, 500].forEach(status => {
      it(`should handle ${status} status for ${httpMethod}`, done => {
        const path = 'test'
        const url = `${fetchInstance.getAPIHost()}${path}`
        const responseData = { body: {test: 'test' }, method: httpMethod, status }
        const body = {body: 'body'}
        fetchMock.mock(url, responseData )
        fetchInstance[httpMethod](path, httpMethod === 'get' ? null : body)
          .do((res: Response) => {
            expect(res).not.to.deep.equal(responseData.body)
            done()
          })
          .catch((res: HttpErrorMessage) => {
            console.log(res)
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
  });

  ['get', 'post', 'put', 'delete'].forEach(httpMethod => {
    it(`decoartor ${httpMethod} should ok`, done => {
      const now = Date.now()
      fetchInstance.middleware(<any>httpMethod, arg => {
        const url = arg.url
        if (url.indexOf('?') !== -1) {
          arg.url = `${url}&_=${now}`
        } else {
          arg.url = `${url}?_=${now}`
        }
        return arg.originFn(arg.url, arg.queryOrBody)
      })

      const url = `${fetchInstance.getAPIHost()}mock${httpMethod}?_=${now}`

      fetchMock.mock(url, JSON.stringify({
        requestTime: now
      }), {
        method: httpMethod
      })

      fetchInstance[httpMethod](`mock${httpMethod}`)
        .subscribe(r => {
          expect(r.requestTime).to.equal(now)
          done()
        })
    })
  })
})
