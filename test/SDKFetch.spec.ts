import { expect } from 'chai'
import { Observable, Scheduler } from 'rxjs'
import { describe, it, beforeEach, afterEach } from 'tman'
import { SDKFetch, forEach, Http } from '.'

const fetchMock = require('fetch-mock')

const allowedMethods: ReadonlyArray<string> = ['get', 'post', 'put', 'delete']

const path = 'test'

describe('SDKFetch setters and getters', () => {

  let sdkFetch: SDKFetch

  const getterSetterGood = (getter: string, setter: string, newValue: any, newResult?: any) => {
    if (arguments.length - 2 === 3) {
      newResult = newValue
    }

    // before setter is called
    expect(sdkFetch[getter]()).to.not.deep.equal(newResult)

    sdkFetch[setter](newValue)

    // after setter is called
    expect(sdkFetch[getter]()).to.deep.equal(newResult)
  }

  beforeEach(() => {
    sdkFetch = new SDKFetch('')
  })

  it('setAPIHost/getAPIHost should write/read internal state correctly', () => {
    getterSetterGood('getAPIHost', 'setAPIHost', 'https://www.example.com')
  })

  it('setHeaders/getHeaders should write/read internal state correctly', () => {
    const newHeader = { 'X-Request-Id': '2333' }
    const headers = sdkFetch.getHeaders()

    getterSetterGood('getHeaders', 'setHeaders', newHeader, { ...headers, ...newHeader })
  })

  it('setToken/getToken should write/read internal state correctly', () => {
    getterSetterGood('getToken', 'setToken', '1234567890')
  })

  it('setOptions/getOptions should write/read internal state correctly', () => {
    const newOption = { responseType: 'arraybuffer' }
    const options = sdkFetch.getOptions()

    getterSetterGood('getOptions', 'setOptions', newOption, { ...options, ...newOption })
  })
})

describe('SDKFetch', () => {

  let sdkFetch: SDKFetch
  const apiHost = 'https://www.teambition.com/api'
  const testUrl = `${apiHost}/${path}`

  beforeEach(() => {
    sdkFetch = new SDKFetch()
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('get should use correctly timestamped url', function* () {
    const urlMatcher = new RegExp(testUrl)
    fetchMock.get(urlMatcher, {})

    // 无 query 的 GET
    yield sdkFetch.get(path)
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
      .subscribeOn(Scheduler.async)
      .do(() => {
        const delimiter = '&_='
        const [prefix, timestamp] = fetchMock.lastUrl(urlMatcher).split(delimiter, 2)
        expect(prefix).to.equal(urlWithQuery)
        expect(new Date(Number(timestamp)).valueOf()).to.closeTo(new Date().valueOf(), 100)
      })
  })

  it('get with empty query object should work correctly', function* () {
    const urlMatcher = new RegExp(testUrl)
    fetchMock.get(urlMatcher, {})

    yield sdkFetch.get(path, {})
      .subscribeOn(Scheduler.async)
      .do(() => {
        const delimiter = '?_='
        const [prefix, timestamp] = fetchMock.lastUrl(urlMatcher).split(delimiter, 2)
        expect(prefix).to.equal(testUrl)
        expect(new Date(Number(timestamp)).valueOf()).to.closeTo(new Date().valueOf(), 100)
      })
  })

  it('get should re-use observable for matching request', () => {
    const getA = sdkFetch.get(path, { value: 'A' })
    const anotherGetA = sdkFetch.get(path, { value: 'A' })
    const getB = sdkFetch.get(path, { value: 'B' })

    // 确定目标值不是 undefined
    expect(getA).not.undefined
    expect(anotherGetA).not.undefined
    expect(getB).not.undefined

    // anotherGetA 应该重用 getA 里的 request observable
    expect(anotherGetA).equal(getA)

    // getB 应该使用自己的 request observable
    expect(getB).not.equal(getA)
  })

  allowedMethods.forEach((httpMethod: string) => {
    it(`method ${httpMethod} should be able to return Http object`, function* () {
      const responseData = { body: { test: 'test' } }
      const body = { body: 'body' }
      let httpObj: Http<any>
      let raw: any
      const urlMatcher = new RegExp(testUrl)
      fetchMock.mock(urlMatcher, responseData)

      switch (httpMethod) {
        case 'get':
          httpObj = sdkFetch[httpMethod](path, null, { wrapped: true })
          raw = sdkFetch[httpMethod](path, null)
          break
        default:
          httpObj = sdkFetch[httpMethod](path, body, { wrapped: true })
          raw = sdkFetch[httpMethod](path, body)
          break
      }

      yield Observable.forkJoin(httpObj.send(), raw)
        .subscribeOn(Scheduler.async)
        .do(([respFromHttpObj, respFromRaw]) => {
          expect(respFromHttpObj).to.deep.equal(respFromRaw)
        })
    })
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

  it('_buildQuery should ignore key \'_\'', () => {
    const query = { _: 123, a: 'a' }
    const actual = sdkFetch['_buildQuery']('', query)
    const expected = `?a=a`
    expect(actual).to.be.equal(expected)
  })
})

describe('SDKFetch options', () => {

  let sdkFetch: SDKFetch

  const newHost = 'https://www.example.com'
  const newHeader = { 'X-Request-Id': '2333' }
  const newToken = '1234567890'
  const newOption = { responseType: 'arraybuffer' }
  const newMockOptions = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'OAuth2 1234567890',
      'X-Request-Id': '2333'
    },
    responseType: 'arraybuffer'
  }

  const requestOptionsGood = function* (httpMethod: string, getCustomizedRequest: () => Observable<any>) {
    fetchMock.mock(new RegExp(newHost), {})

    yield getCustomizedRequest()
      .subscribeOn(Scheduler.async)
      .do(() => {
        expect(fetchMock.lastOptions()).to.deep.equal({
          method: httpMethod,
          ...newMockOptions
        })
      })
  }

  beforeEach(() => {
    sdkFetch = new SDKFetch()
  })

  afterEach(() => {
    fetchMock.restore()
  })

  allowedMethods.forEach((httpMethod: string) => {
    it(`setters should take effect in ${httpMethod} request`, function* () {
      yield requestOptionsGood(httpMethod, () => {
        sdkFetch
          .setAPIHost(newHost)
          .setHeaders(newHeader)
          .setToken(newToken)
          .setOptions(newOption)
        return sdkFetch[httpMethod](path)
      })
    })
  })

  it('setters\' effect should be kept across requests', function* () {
    yield allowedMethods.forEach(function* (httpMethod1: string) {
      yield allowedMethods.forEach(function* (httpMethod2: string) {
        yield requestOptionsGood(httpMethod2, () => {
          sdkFetch
            .setAPIHost(newHost)
            .setHeaders(newHeader)
            .setToken(newToken)
            .setOptions(newOption)

          return sdkFetch[httpMethod1](path)
            .switchMap(() => sdkFetch[httpMethod2](path))
        })
      })
    })
  })

  allowedMethods.forEach((httpMethod: string) => {
    it(`per request setting should work for ${httpMethod}`, function* () {
      yield requestOptionsGood(httpMethod, () => {
        return sdkFetch[httpMethod](path, undefined, {
          apiHost: newHost,
          headers: newHeader,
          token: newToken,
          ...newOption
        })
      })
    })
  })

  it('per request setting should not take effect across requests', function* () {
    yield allowedMethods.forEach(function* (httpMethod1: string) {
      yield allowedMethods.forEach(function* (httpMethod2: string) {
        yield requestOptionsGood(httpMethod2, () => {
          const perRequestOptions = {
            apiHost: newHost + '.cn',
            headers: { ...newHeader, hello: 'world' },
            token: newToken + '1',
            ...{ ...newOption, good: 'bye' }
          }

          sdkFetch
            .setAPIHost(newHost)
            .setHeaders(newHeader)
            .setToken(newToken)
            .setOptions(newOption)

          return sdkFetch[httpMethod1](path, undefined, perRequestOptions)
            .switchMap(() => sdkFetch[httpMethod2](path))
        })
      })
    })
  })
})
