'use strict'
import * as chai from 'chai'
import {Fetch} from '../index'
const fetchMock = require('fetch-mock')

const expect = chai.expect

export default describe('utils/fetch', () => {

  let fetch: Fetch

  beforeEach(() => {
    fetch = new Fetch()
  })

  it('should configure api host', () => {
    expect(Fetch.getAPIHost()).to.equal('https://www.teambition.com/api')
    const url = 'https://www.example.com'
    Fetch.setAPIHost(url)
    expect(Fetch.getAPIHost()).to.equal(url)
  })

  it('should call isomophic fetch with the correct arguments', () => {
    const path = '/test'
    const url = `${Fetch.getAPIHost()}${path}`
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
      })
  })

  it('should set token', () => {
    const token = 'test_token'
    const apiHost = 'https://api.teambition.com'
    const path = '/test'
    const url = `${apiHost}${path}`
    Fetch.setToken(token)
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
      })
  });

  ['get', 'post', 'put', 'delete'].forEach((httpMethod) => {
    it(`should define ${httpMethod}`, () => {
      const path = '/test'
      const url = `${Fetch.getAPIHost()}${path}`
      const responseData = {test: 'test'}
      const body = {body: 'body'}
      fetchMock.mock(url, httpMethod, responseData)
      return fetch[httpMethod](path, body)
        .then((res) => {
          expect(fetchMock.lastOptions().method).to.equal(httpMethod)
          expect(res).to.deep.equal(responseData)
          if (httpMethod === 'put' || httpMethod === 'post') {
            expect(fetchMock.lastOptions().body).to.equal(body)
          }
          fetchMock.restore()
        })
    })
  });

  ['get', 'post', 'put', 'delete'].forEach((httpMethod) => {
    [100, 400, 401, 403, 404, 500].forEach((status) => {
      it(`should handle ${status} status for ${httpMethod}`, () => {
        const path = '/test'
        const url = `${Fetch.getAPIHost()}${path}`
        const responseData = {body: {test: 'test'}, status: status}
        const body = {body: 'body'}
        fetchMock.mock(url, httpMethod, responseData)
        return fetch[httpMethod](path, body)
          .then((res) => {
            expect(res).not.to.deep.equal(responseData.body)
          })
          .catch((res) => {
            expect(fetchMock.lastOptions().method).to.equal(httpMethod)
            expect(res.status).to.deep.equal(responseData.status)
            fetchMock.restore()
          })
      })
    })
  })
})
