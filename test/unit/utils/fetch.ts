'use strict'
import * as chai from 'chai'
import { Fetch } from '../index'
const fetchMock = require('fetch-mock')

const expect = chai.expect

export default describe('utils/fetch', () => {

  let fetch: Fetch

  beforeEach(() => {
    fetch = new Fetch()
  })

  it('should configure api host', () => {
    expect(fetch.getAPIHost()).to.equal('https://www.teambition.com/api/')
    const url = 'https://www.example.com'
    fetch.setAPIHost(url)
    expect(fetch.getAPIHost()).to.equal(url)
  })

  it('should call isomophic fetch with the correct arguments', done => {
    const path = '/test'
    const url = `${fetch.getAPIHost()}${path}`
    const data = {test: 'test'}
    fetchMock.mock(url, data)
    return fetch.get(path)
      .then(() => {
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

  it('should set token', done => {
    const token = 'test_token'
    const apiHost = 'https://www.teambition.com/api/'
    const path = 'test'
    const url = `${apiHost}${path}`
    fetch.setToken(token)
    fetchMock.mock(url, {})
    return fetch.get(path)
      .then((res) => {
        expect(fetchMock.lastOptions()).to.deep.equal({
          method: 'get',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `OAuth2 ${token}`
          }
        })
        fetchMock.restore()
        fetch.restore()
        done()
      })
  });

  ['get', 'post', 'put', 'delete'].forEach((httpMethod) => {
    it(`should define ${httpMethod}`, done => {
      const path = 'test'
      const url = `${fetch.getAPIHost()}${path}`
      const responseData = {test: 'test'}
      const body = {body: 'body'}
      fetchMock.mock(url, httpMethod, responseData)
      return fetch[httpMethod](path, httpMethod === 'get' ? null : body)
        .then((res) => {
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
    [100, 400, 401, 403, 404, 500].forEach(status => {
      it(`should handle ${status} status for ${httpMethod}`, done => {
        const path = 'test'
        const url = `${fetch.getAPIHost()}${path}`
        const responseData = {body: {test: 'test'}, status: status}
        const body = {body: 'body'}
        fetchMock.mock(url, httpMethod, responseData)
        return fetch[httpMethod](path, httpMethod === 'get' ? null : body)
          .then((res: Response) => {
            expect(res).not.to.deep.equal(responseData.body)
            done()
          })
          .catch((res: Response) => {
            if (fetchMock.lastOptions()) {
              expect(fetchMock.lastOptions().method).to.equal(httpMethod)
            }
            expect(res.status).to.deep.equal(responseData.status)
            fetchMock.restore()
            done()
          })
      })
    })
  });

  ['get', 'post', 'put', 'delete'].forEach(httpMethod => {
    it(`decoartor ${httpMethod} should ok`, done => {
      const now = Date.now()
      fetch.middleware(<any>httpMethod, (method, arg) => {
        const url = arg.url
        if (url.indexOf('?') !== -1) {
          arg.url = `${url}&_=${now}`
        }else {
          arg.url = `${url}?_=${now}`
        }
      })

      const url = `${fetch.getAPIHost()}mock${httpMethod}?_=${now}`

      fetchMock.mock(url, httpMethod, {
        requestTime: now
      })

      fetch[httpMethod](`mock${httpMethod}`)
        .then(r => {
          expect(r.requestTime).to.equal(now)
          done()
        })
    })
  })
})
