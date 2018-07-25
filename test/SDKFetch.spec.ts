import { expect } from 'chai'
import { Observable, Scheduler } from 'rxjs'
import { describe, it, beforeEach, afterEach } from 'tman'
import { SDKFetch, forEach, Http } from '.'
import { clone } from './'

import { defaultSDKFetchHeaders } from '../src/SDKFetch'

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

  it('setHeaders should support set-by-merge: false by default', () => {
    const headers = { hello: 'world' }
    sdkFetch.setHeaders(headers)
    expect(sdkFetch.getHeaders()).to.deep.equal(headers)
  })

  it('setHeaders should support set-by-merge: true', () => {
    const headersA = { hello: 'world' }
    sdkFetch.setHeaders(headersA)

    const headersB = { goodbye: 'world' }
    sdkFetch.setHeaders(headersB, true)
    expect(sdkFetch.getHeaders()).to.deep.equal({ ...headersA, ...headersB })
  })

  it('getHeaders should return a deep copy of the current headers object', () => {
    const originalHeaders = { hello: 'world' }

    sdkFetch.setHeaders(originalHeaders)
    const headers = sdkFetch.getHeaders()
    headers!['hello'] = 'you'

    expect(sdkFetch.getHeaders()).to.deep.equal(originalHeaders)
  })

  it('getOptions should return a deep copy of the current options object', () => {
    const originalOptions = { responseType: 'arraybuffer' }

    sdkFetch.setOptions(originalOptions)
    const options = sdkFetch.getOptions()
    options!['hello'] = 'you'

    expect(sdkFetch.getOptions()).to.deep.equal(originalOptions)
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
      .subscribeOn(Scheduler.asap)
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
      .subscribeOn(Scheduler.asap)
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
      .subscribeOn(Scheduler.asap)
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
        .subscribeOn(Scheduler.asap)
        .do(([respFromHttpObj, respFromRaw]) => {
          expect(respFromHttpObj).to.deep.equal(respFromRaw)
        })
    })
  })

  allowedMethods.forEach((httpMethod: string) => {
    it(`method ${httpMethod} should be able to return with response headers`, function* () {
      const responseData = { test: 'test' }
      const body = { body: 'body' }
      const sampleValue = '2333'

      let withRespHeaders$: Observable<any>

      fetchMock.mock(new RegExp(testUrl), {
        body: JSON.stringify(responseData),
        headers: {
          'X-Request-Id': sampleValue
        }
      }, {
        method: httpMethod
      })

      switch (httpMethod) {
      case 'get':
        withRespHeaders$ = sdkFetch[httpMethod](path, null, { includeHeaders: true })
        break
      default:
        withRespHeaders$ = sdkFetch[httpMethod](path, body, { includeHeaders: true })
        break
      }

      yield withRespHeaders$
        .subscribeOn(Scheduler.asap)
        .do((resp) => {
          expect(resp.body).to.deep.equal(responseData)
          expect(resp.headers['x-request-id']).to.equal(sampleValue)
        })
    })
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
      'Authorization': 'OAuth2 1234567890',
      'X-Request-Id': '2333'
    },
    responseType: 'arraybuffer'
  }

  const requestOptionsGood = function* (httpMethod: string, getCustomizedRequest: () => Observable<any>) {
    fetchMock.mock(new RegExp(newHost), {})

    yield getCustomizedRequest()
      .subscribeOn(Scheduler.asap)
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

  it('defaultSDKFetchHeaders should be immutable', () => {
    const headers = defaultSDKFetchHeaders()
    const headersClone = clone(headers)

    headers['X-Request-Id'] = '2333'

    expect(defaultSDKFetchHeaders()).to.deep.equal(headersClone)
  })

  allowedMethods.forEach((httpMethod: string) => {
    it(`use default headers when headers are not set: ${httpMethod}`, function* () {
      fetchMock.mock(new RegExp(''), {})

      sdkFetch
        .setAPIHost(newHost)
        .setOptions(newOption)

      yield sdkFetch[httpMethod](path)
        .subscribeOn(Scheduler.asap)
        .do(() => {
          expect(fetchMock.lastOptions().headers).to.deep.equal({
            ...defaultSDKFetchHeaders()
          })
        })
    })
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

  allowedMethods.forEach((httpMethod1: string) => {
    allowedMethods.forEach((httpMethod2: string) => {
      it(`setters' effect should be kept across requests: ${httpMethod1} then ${httpMethod2}`, function* () {
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

  allowedMethods.forEach((httpMethod: string) => {
    it(`per request header setting in merge mode should work: ${httpMethod}`, function* () {
      fetchMock.mock(new RegExp(''), {})

      yield sdkFetch[httpMethod](path, undefined, {
        headers: { ...newHeader, merge: true },
      })
        .subscribeOn(Scheduler.asap)
        .do(() => {
          expect(fetchMock.lastOptions().headers).to.deep.equal({
            ...defaultSDKFetchHeaders(), ...newHeader
          })
        })
    })
  })

  allowedMethods.forEach((httpMethod1: string) => {
    allowedMethods.forEach((httpMethod2: string) => {
      it(`per request setting should not take effect across requests: ${httpMethod1} then ${httpMethod2}`, function* () {
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

describe('SDKFetch.buildQuery', () => {
  it('should serialize array to query string', () => {
    const query = { a: 'a', b: [1, 2, 'b', 'b'], c: 3 }
    const parts: string[] = []
    forEach(query, (value, key) => {
      if (!Array.isArray(value)) {
        value = <any>[value]
      }
      parts.push(...(<any[]>value).map(v => `${key}=${v}`))
    })
    const actual = SDKFetch.buildQuery('', query)
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
    const actual = SDKFetch.buildQuery('http://abc.com?_=123', query)
    const expected = `http://abc.com?_=123&${parts.join('&')}`
    expect(actual).to.be.equal(expected)
  })

  it('should ignore key \'_\'', () => {
    const query = { _: 123, a: 'a' }
    const actual = SDKFetch.buildQuery('', query)
    const expected = `?a=a`
    expect(actual).to.be.equal(expected)
  })

  it('should prevent `&` from being added for query { key: undefined }', () => {
    expect(SDKFetch.buildQuery('?_=123', { optional: undefined })).to.equal('?_=123')
    expect(SDKFetch.buildQuery('?', { optional: undefined })).to.equal('?')
    expect(SDKFetch.buildQuery('?', { optional: undefined, required: true })).to.equal('?required=true')
    expect(SDKFetch.buildQuery('', { optional: undefined })).to.equal('')
    expect(SDKFetch.buildQuery('', { optional: undefined, required: true })).to.equal('?required=true')
  })

  it('should encode query correctly', () => {
    expect(SDKFetch.buildQuery('', {
      q: ''
    })).to.equal('?q=')

    expect(SDKFetch.buildQuery('', {
      q: 'noNeedToEncode0-9-_.!~*\'()'
    })).to.equal('?q=noNeedToEncode0-9-_.!~*\'()')

    expect(SDKFetch.buildQuery('', {
      q: 'hello world'
    })).to.equal('?q=hello%20world')

    expect(SDKFetch.buildQuery('', {
      q: '你(ni)好(hao)'
    })).to.equal('?q=%E4%BD%A0(ni)%E5%A5%BD(hao)')
  })

  it('should encode query in an idempotent manner', () => {
    expect(SDKFetch.buildQuery('', {
      q: 'hello%20world'
    })).to.equal('?q=hello%20world')

    expect(SDKFetch.buildQuery('', {
      q: '%E4%BD%A0(ni)%E5%A5%BD(hao)'
    })).to.equal('?q=%E4%BD%A0(ni)%E5%A5%BD(hao)')
  })
})
