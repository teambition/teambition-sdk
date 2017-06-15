import { expect } from 'chai'
import { Scheduler } from 'rxjs'
import { describe, it, beforeEach } from 'tman'
import { SDKFetch, forEach } from '.'

const fetchMock = require('fetch-mock')

export default describe('SDKFetch', () => {

  let sdkFetch: SDKFetch
  const apiHost = 'https://www.teambition.com/api'
  const path = 'test'
  const testUrl = `${apiHost}/${path}`

  beforeEach(() => {
    sdkFetch = new SDKFetch()
  })

  it('setAPIHost/getAPIHost should configure api host', () => {
    expect(sdkFetch.getAPIHost()).to.equal('https://www.teambition.com/api')
    const myUrl = 'https://www.example.com'
    sdkFetch.setAPIHost(myUrl)
    expect(sdkFetch.getAPIHost()).to.equal(myUrl)
  })

  it('setHeaders should work', function* () {
    const headers = { 'X-Request-Id': '2333' }
    sdkFetch.setHeaders(headers)
    fetchMock.mock(new RegExp(testUrl), {})
    yield sdkFetch.get(path)
      .send()
      .subscribeOn(Scheduler.async)
      .do(() => {
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
      })
  })

  it('setToken should work', function* () {
    const token = 'secret, public :)'
    sdkFetch.setToken(token)
    fetchMock.getOnce(new RegExp(testUrl), {})
    yield sdkFetch.get(path)
      .send()
      .subscribeOn(Scheduler.async)
      .do(() => {
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
  })

  it('get should use correctly timestamped url', function* () {
    const urlMatcher = new RegExp(testUrl)
    fetchMock.get(urlMatcher, {})

    // 无 query 的 GET
    yield sdkFetch.get(path)
      .send()
      .subscribeOn(Scheduler.async)
      .do(() => {
        const delimiter = '?_='
        const [prefix, timestamp] = fetchMock.lastUrl(urlMatcher).split(delimiter, 2)
        expect(prefix).to.equal(testUrl)
        expect(new Date(Number(timestamp)).valueOf()).to.closeTo(new Date().valueOf(), 100)
      })

    // 带 query 的 GET
    const query = { value: 'A' }
    const urlWithQuery = testUrl + '?value=A'
    yield sdkFetch.get(path, query)
      .send()
      .subscribeOn(Scheduler.async)
      .do(() => {
        const delimiter = '&_='
        const [prefix, timestamp] = fetchMock.lastUrl(urlMatcher).split(delimiter, 2)
        expect(prefix).to.equal(urlWithQuery)
        expect(new Date(Number(timestamp)).valueOf()).to.closeTo(new Date().valueOf(), 100)
        fetchMock.restore()
      })
  })

  it('get should re-use observable for mathcing request', () => {
    const getA = sdkFetch.get(path, { value: 'A' })
    const anotherGetA = sdkFetch.get(path, { value: 'A' })
    const getB = sdkFetch.get(path, { value: 'B' })

    // 确定目标值不是 undefined
    expect(getA['request']).not.undefined
    expect(anotherGetA['request']).not.undefined
    expect(getB['request']).not.undefined

    // anotherGetA 应该重用 getA 里的 request observable
    expect(anotherGetA['request']).equal(getA['request'])

    // getB 应该使用自己的 request observable
    expect(getB['request']).not.equal(getA['request'])
  })

  it('_buildQuery should serialize array to query string', () => {
    const query = { a: 'a', b: [1, 2, 'b', 'b'], c: 3 }
    const parts: string[] = []
    forEach(query, (value, key) => {
      if (!Array.isArray(value)) {
        value = <any>[value]
      }
      parts.push(...(<any[]>value).map(v => `${key}=${v}`))
    })
    const actual = sdkFetch['_buildQuery']('', query)
    const expected = `?${parts.join('&')}`
    expect(actual).to.be.equal(expected)
  })

  it('_buildQuery should serialize query with queryUrl to query string', () => {
    const query = { a: 'a', b: [1, 2, 'b', 'b'], c: 3 }
    const parts: string[] = []
    forEach(query, (value, key) => {
      if (!Array.isArray(value)) {
        value = <any>[value]
      }
      parts.push(...(<any[]>value).map(v => `${key}=${v}`))
    })
    const actual = sdkFetch['_buildQuery']('http://abc.com?_=123', query)
    const expected = `http://abc.com?_=123&${parts.join('&')}`
    expect(actual).to.be.equal(expected)
  })
})
