import { expect } from 'chai'
import { Observable, Scheduler } from 'rxjs'
import { map as rxMap } from 'rxjs/operators'
import { describe, it, beforeEach, afterEach } from 'tman'
import { SDK, SDKFetch, forEach, Http, HttpErrorMessage, headers2Object, createSdk } from '.'
import { clone } from './'

import { defaultSDKFetchHeaders, HttpHeaders } from '../src/SDKFetch'

const fetchMock = require('fetch-mock')

const allowedMethods: ['get', 'post', 'put', 'delete'] = ['get', 'post', 'put', 'delete']

const path = 'test'

describe('SDKFetch setters and getters', () => {

  let sdkFetch: SDKFetch

  const getterSetterGood = (getter: string, setter: string, newValue: any, ...optionalArgs: any[]) => {
    const newResult = optionalArgs.length === 0 ? newValue : optionalArgs[0]

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

  it('setHeaders/getHeaders should write/read internal state correctly - merge: true', () => {
    const newHeader = { 'X-Request-Id': '2333' }
    const headers = sdkFetch.getHeaders()

    expect(sdkFetch.getHeaders()).to.not.deep.equal({ ...headers, ...newHeader })
    sdkFetch.setHeaders(newHeader, true)
    expect(sdkFetch.getHeaders()).to.deep.equal({ ...headers, ...newHeader })
  })

  it('setHeaders/getHeaders should write/read internal state correctly - merge: false', () => {
    const newHeader = { 'X-Request-Id': '2333' }

    expect(sdkFetch.getHeaders()).to.not.deep.equal(newHeader)
    sdkFetch.setHeaders(newHeader, false)
    expect(sdkFetch.getHeaders()).to.deep.equal(newHeader)
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
  const urlMatcher = new RegExp(testUrl)

  beforeEach(() => {
    sdkFetch = new SDKFetch()
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('get should use correctly timestamped url', function* () {
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

  it('`cache` should effected', function* () {
    fetchMock.get(urlMatcher, {})

    // 无 query 的 GET
    yield sdkFetch.get(path, null, { cache: true })
      .subscribeOn(Scheduler.asap)
      .do(() => {
        expect(fetchMock.lastUrl(urlMatcher).indexOf('?_=')).to.equal(-1)
      })

    // 有 query 的 GET
    const query = { value: 'A' }
    yield sdkFetch.get(path, query, { cache: true })
      .subscribeOn(Scheduler.asap)
      .do(() => {
        expect(fetchMock.lastUrl(urlMatcher).indexOf('&_=')).to.equal(-1)
      })
  })

  it('`cache` default should be `false`', function* () {
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
    fetchMock.get(urlMatcher, {})

    const emptyQueryObjects = [
      {},
      { key: undefined },
      { key: [] },
      { key1: undefined, key2: [] }
    ]

    for (const query of emptyQueryObjects) {
      yield sdkFetch.get(path, query)
        .subscribeOn(Scheduler.asap)
        .do(() => {
          const [beforeTimestamp] = fetchMock.lastUrl(urlMatcher).split('_=')
          expect(beforeTimestamp).to.equal(testUrl + '?')
        })
    }
  })

  it('should re-use a matching request A if A is in progress', function* () {
    fetchMock.mock(urlMatcher, { body: { 'A': 'aaaa' } })

    const getA = sdkFetch.get(path, { value: 'A' }).delay(20)
    const getAImmediatelyAfter = sdkFetch.get(path, { value: 'A' })

    yield Observable.merge(getA, getAImmediatelyAfter)
      .take(2)
      .subscribeOn(Scheduler.asap)

    yield Observable.of(fetchMock.calls(urlMatcher).length)
      .do((numberOfRequestsReceived) => {
        expect(numberOfRequestsReceived).to.equal(1)
      })
  })

  it('should re-use a matching request A even if subscriber count has dropped to zero previously', function* () {
    fetchMock.mock(urlMatcher, Observable.of({ body: { 'A': 'aaaa' } }).delay(10).toPromise())

    const getA = sdkFetch.get(path, { value: 'A' })
    const getANext = sdkFetch.get(path, { value: 'A' })

    yield Observable.from([ getA, getANext ], Scheduler.asap)
      .switch() // 确保 getA 的订阅与 getANext 的订阅在时间上是隔离的，
                // 也就是在 getANext 被订阅前，请求源的订阅数降到了 0
      .do((response) => {
        expect(response).to.deep.equal({ 'A': 'aaaa' })
      })

    expect(fetchMock.calls(urlMatcher).length).to.equal(1)
  })

  it('should not re-use a matching request A if A is finished', function* () {
    fetchMock.mock(urlMatcher, { body: { 'A': 'aaaa' } })

    const getA = sdkFetch.get(path, { value: 'A' })
    const getAAWhileAfter = Observable.defer(() => sdkFetch.get(path, { value: 'A' }))

    yield Observable.concat(getA, Observable.timer(40), getAAWhileAfter)
      .take(3)
      .subscribeOn(Scheduler.asap)

    expect(fetchMock.calls(urlMatcher).length).to.equal(2)
  })

  it('should only apply `Http` object `mapFn`(internal-use only) once for each request sent', function* () {
    fetchMock.mock(urlMatcher, { body: 'hello' })

    const httpObj = sdkFetch.get<string>(path, {}, { wrapped: true })
    httpObj['mapFn'] = rxMap((s) => `${s} world`)

    yield httpObj.send()
      .do((response) => {
        expect(response).to.equal('hello world')
      })
  })

  allowedMethods.forEach((httpMethod: string) => {
    it(`method ${httpMethod} should be able to return Http object`, function* () {
      const responseData = { body: { test: 'test' } }
      const body = { body: 'body' }
      let httpObj: Http<any>
      let raw: any
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
          expect(resp.headers.get('x-request-id')).to.equal(sampleValue)
        })
    })
  })

  allowedMethods.forEach((httpMethod) => {
    [400, 401, 403, 404, 500].forEach((status) => {
      it(`method ${httpMethod} should throw on ${status} with info`, function* () {
        const responseData = {
          body: { test: 'test' },
          method: httpMethod,
          status,
          headers: { hello: 'world' }
        }
        const body = { body: 'body' }
        fetchMock.mock(urlMatcher, responseData)

        sdkFetch
          .setAPIHost(apiHost)

        yield sdkFetch[httpMethod](path, httpMethod === 'get' ? null : body)
          .catch((info: HttpErrorMessage) => {
            expect(info.error.status).to.equal(status)
            expect(info.error.headers.get('hello')).to.equal('world')
            expect(info.method).to.equal(httpMethod)
            expect(info.url).to.equal(fetchMock.lastUrl(urlMatcher))
            if (httpMethod === 'get') {
              expect(info.body).to.be.undefined
            } else {
              expect(info.body).to.deep.equal(body)
            }
            expect(info.requestId).to.equal(fetchMock.lastOptions(urlMatcher).headers[HttpHeaders.Key.RequestId])
            return Observable.empty()
          })
          .subscribeOn(Scheduler.asap)
      })
    })
  })
})

describe('SDKFetch options', () => {

  let sdkFetch: SDKFetch

  const newHost = 'https://www.example.com'
  const newHeader = {
    [HttpHeaders.Key.RequestId]: '2333' // 固定 x-request-id 这个头字段，方便测试
  }
  const newToken = '1234567890'
  const newOption = { responseType: 'arraybuffer' }
  const newMockOptions = {
    headers: {
      'Authorization': 'OAuth2 1234567890',
      [HttpHeaders.Key.RequestId]: '2333'
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

  it('defaultSDKFetchHeaders should return normalized headers', () => {
    const headers = defaultSDKFetchHeaders()
    const normalizedHeaders = headers2Object(new Headers(headers))

    expect(headers).to.deep.equal(normalizedHeaders)
  })

  allowedMethods.forEach((httpMethod) => {
    it(`use default headers when headers are not set: ${httpMethod}`, function* () {
      fetchMock.mock(new RegExp(''), {})

      sdkFetch
        .setAPIHost(newHost)
        .setOptions(newOption)

      yield sdkFetch[httpMethod](path, undefined, { disableRequestId: true } )
        .subscribeOn(Scheduler.asap)
        .do(() => {
          expect(fetchMock.lastOptions().headers).to.deep.equal({
            ...defaultSDKFetchHeaders()
          })
        })
    })
  })

  allowedMethods.forEach((httpMethod) => {
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

  allowedMethods.forEach((httpMethod1) => {
    allowedMethods.forEach((httpMethod2) => {
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

  allowedMethods.forEach((httpMethod) => {
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

  allowedMethods.forEach((httpMethod) => {
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

  allowedMethods.forEach((httpMethod1) => {
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

  allowedMethods.forEach((httpMethod) => {
    it(`per (${httpMethod}) request setting should attach X-Request-Id to headers`, function* () {
      fetchMock.mock(new RegExp(newHost), {})

      sdkFetch
        .setAPIHost(newHost)
        .setHeaders({ hello: 'world' })

      yield sdkFetch[httpMethod](path)
        .subscribeOn(Scheduler.asap)
        .do(() => {
          expect(Boolean(fetchMock.lastOptions().headers[HttpHeaders.Key.RequestId])).to.be.true
        })
    })
  })

  allowedMethods.forEach((httpMethod) => {
    it(`per (${httpMethod}) request setting should allow user defined X-Request-Id header`, function* () {
      fetchMock.mock(new RegExp(newHost), {})
      const userDefinedRequestId = '2'

      sdkFetch
        .setAPIHost(newHost)
        .setHeaders({ hello: 'world' })

      yield sdkFetch[httpMethod](path, undefined, { headers: {
        merge: true,
        [HttpHeaders.Key.RequestId]: userDefinedRequestId
      } })
        .subscribeOn(Scheduler.asap)
        .do(() => {
          expect(fetchMock.lastOptions().headers).to.deep.equal({
            hello: 'world', [HttpHeaders.Key.RequestId]: userDefinedRequestId
          })
        })
    })
  })

  allowedMethods.forEach((httpMethod) => {
    it(`per (${httpMethod}) request setting should attach user defined X-Request-Id header to error thrown`, function* () {
      fetchMock.mock(new RegExp(newHost), { status: 500 })
      const userDefinedRequestId = '2'

      sdkFetch
        .setAPIHost(newHost)
        .setHeaders({ hello: 'world' })

      yield sdkFetch[httpMethod](path, undefined, { headers: {
        merge: true,
        [HttpHeaders.Key.RequestId]: userDefinedRequestId
      } })
        .catch((info: HttpErrorMessage) => {
          expect(info.requestId).to.equal(String(userDefinedRequestId))
          return Observable.empty()
        })
        .subscribeOn(Scheduler.asap)
    })
  })

})

describe('graphql request/response', () => {
  let sdk: SDK
  let errorThrown: boolean
  const url = 'https://www.example.com/graphql'

  beforeEach(() => {
    sdk = createSdk()
    sdk.fetch.setAPIHost('https://www.example.com')
    sdk.setGraphQLEndpoint('graphql')
    errorThrown = false
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('should throw error on failed HTTP connection', function* () {
    fetchMock.mock(new RegExp(url), { status: 404 })
    yield sdk.graph('')
      .catch((info: HttpErrorMessage) => {
        expect(info.error.status).to.equal(404)
        errorThrown = true
        return Observable.empty()
      })
      .subscribeOn(Scheduler.asap)
    expect(errorThrown).to.be.true
  })

  it('should throw error on failed backend execution', function* () {
    fetchMock.mock(new RegExp(url), {
      data: {}, // data 与 errors 字段根据标准是可以同时存在的
      errors: [{ message: 'error!' }, { message: 'sorry!' }]
    })
    yield sdk.graph('')
      .catch((info) => {
        expect(info.message).to.equal(`error!\nsorry!`)
        errorThrown = true
        return Observable.empty()
      })
      .subscribeOn(Scheduler.asap)
    expect(errorThrown).to.be.true
  })

  it('should emit `data` when `errors` is not present', function* () {
    const data = { recommend: { organization: { _id: '123', name: 'test' } } }
    fetchMock.mock(new RegExp(url), { data })
    yield sdk.graph('')
      .do((resp) => {
        expect(resp).to.deep.equal(data)
      })
      .subscribeOn(Scheduler.asap)
  })
})

describe('HttpHeaders', () => {
  it(`${HttpHeaders.create.name}() should normalize 'headers': key -> lower-case, value -> string`, () => {
    expect(HttpHeaders.create({ 'AbCd': 14 }, { disableRequestId: true }))
      .to.deep.equal({ 'abcd': '14' })
  })

  it(`${HttpHeaders.create.name}() should normalize 'options.mergeHeaders': key -> lower-case, value -> string`, () => {
    expect(HttpHeaders.create({}, { customHeaders: { 'AbCd': 14 }, disableRequestId: true }))
      .to.deep.equal({ 'abcd': '14' })
  })

  it(`${HttpHeaders.create.name}() should allow key-value pairs in 'options.mergeHeader' to override the corresponding pairs in 'headers'`, () => {
    expect(HttpHeaders.create({ 'aBcD': 24 }, { customHeaders: { 'AbCd': 14 }, disableRequestId: true }))
      .to.deep.equal({ 'abcd': '14' })
  })

  it(`${HttpHeaders.create.name}() should allow custom-defined 'x-request-id'(case-insensitive)`, () => {
    const samples = [{ 'X-Request-Id': '0' }, { 'X-Request-ID': '0' }, { 'x-request-id': '0' }]

    samples.forEach((sample) => {
      expect(HttpHeaders.create({}, { customHeaders: sample })).to.deep.equal({ [HttpHeaders.Key.RequestId]: '0' })
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

  it('should prevent `&` from being added for query { key: [] }', () => {
    expect(SDKFetch.buildQuery('', { maybeEmpty: [] })).to.equal('')
    expect(SDKFetch.buildQuery('', { maybeEmpty: [], required: true })).to.equal('?required=true')
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
