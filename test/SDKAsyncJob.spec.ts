import { expect } from 'chai'
import * as sinon from 'sinon'
import { describe, it, beforeEach, afterEach } from 'tman'

import { SDKAsyncJob } from '../src/SDKAsyncJob'
import { SDKFetch } from '../src/SDKFetch'
import { Scheduler } from 'rxjs'
import { of } from 'rxjs/observable/of'

const fetchMock = require('fetch-mock')

const path = 'test'
const allowedMethods: ['get', 'post', 'put', 'delete'] = ['get', 'post', 'put', 'delete']

describe('SDKAsyncJob', () => {

  let sdkFetch: SDKFetch
  let sdkAsyncJob: SDKAsyncJob
  const apiHost = 'https://www.teambition.com/api'
  const testUrl = `${apiHost}/${path}`
  const pollingUrl = `${apiHost}/async-jobs`
  const urlMatcher = new RegExp(testUrl)
  const pollingUrlMatcher = new RegExp(pollingUrl)

  beforeEach(() => {
    sdkFetch = new SDKFetch()
    sdkFetch.setAPIHost(apiHost)
    sdkAsyncJob = new SDKAsyncJob(sdkFetch)
  })

  afterEach(() => {
    fetchMock.restore()
  })

  allowedMethods.forEach((method) => {
    it(`method ${method} should no difference with SDKFetch.${method} if job respond in time`, function* () {
      fetchMock.mock(urlMatcher, { result: 'foo' })
      let fetchResult: string

      yield sdkFetch[method]<{ result: string }>(path)
        .subscribeOn(Scheduler.asap)
        .do((res) => {
          fetchResult = res.result
        })

      yield (sdkAsyncJob[method] as any)(path)
        .subscribeOn(Scheduler.asap)
        .do((res: { result: string }) => {
          expect(res.result).to.equal(fetchResult)
        })
    })
  })

  it('should return response directly if response is not an object', function* () {
    fetchMock.mock(urlMatcher, 'foo')

    yield sdkAsyncJob.get<string>(path)
      .subscribeOn(Scheduler.asap)
      .do(res => {
        expect(res).to.equal('foo')
      })
  })

  it('should start polling if response has "timeout"', function* () {
    fetchMock.mock(urlMatcher, {
      timeout: true,
      readyKey: '233'
    })

    fetchMock.mock(pollingUrlMatcher, {
      result: {
        '233': {
          isDone: true,
          response: {
            status: 200,
            headers: '',
            body: { result: 'foo' }
          }
        }
      }
    })

    yield sdkAsyncJob.get<{ result: string }>(path)
      .subscribeOn(Scheduler.asap)
      .do((res) => {
        expect(res.result).to.equal('foo')
      })
  })

  it('should continue polling until result responded', function* (this: any) {
    this.timeout(1000 * 60)

    fetchMock.mock(urlMatcher, {
      timeout: true,
      readyKey: '233'
    })

    let pollingTimes = 0

    fetchMock.mock(pollingUrlMatcher, () => {
      if (pollingTimes === 2) {
        return {
          result: {
            '233': {
              isDone: true,
              response: {
                status: 200,
                headers: '',
                body: { result: 'foo' }
              }
            }
          }
        }
      } else {
        pollingTimes++
        return {
          result: {
            '233': {
              isDone: false
            }
          }
        }
      }
    })

    yield sdkAsyncJob.get<{ result: string }>(path, void 0, {
      pollingOptions: {
        interval: 100,
      }
    })
      .subscribeOn(Scheduler.asap)
      .do((res) => {
        expect(res.result).to.equal('foo')
      })
  })

  it('should throw an error if status code >= 400', function* () {
    fetchMock.mock(urlMatcher, {
      timeout: true,
      readyKey: '233'
    })

    fetchMock.mock(pollingUrlMatcher, {
      result: {
        '233': {
          isDone: true,
          response: {
            status: 401,
            body: 'something is wrong'
          }
        }
      }
    })

    yield sdkAsyncJob.get<{ result: string }>(path)
      .subscribeOn(Scheduler.asap)
      .catch((e: Error) => {
        expect(e.message).to.equal('something is wrong')
        return of(null)
      })
  })

  it('should throw an error if response body is undefined', function* () {
    fetchMock.mock(urlMatcher, {
      timeout: true,
      readyKey: '233'
    })

    fetchMock.mock(pollingUrlMatcher, {
      result: {
        '233': {
          isDone: true
        }
      }
    })

    yield sdkAsyncJob.get<{ result: string }>(path)
      .subscribeOn(Scheduler.asap)
      .catch((e: Error) => {
        expect(e.message).to.equal('response is undefined')
        return of(null)
      })
  })
})

describe('SDKAsyncJob options', () => {
  let sdkFetch: SDKFetch
  let sdkAsyncJob: SDKAsyncJob
  const apiHost = 'https://www.teambition.com/api'
  const testUrl = `${apiHost}/${path}`
  const pollingUrl = `${apiHost}/async-jobs`
  const urlMatcher = new RegExp(testUrl)
  const pollingUrlMatcher = new RegExp(pollingUrl)
  const successResponse = {
    result: {
      '233': {
        isDone: true,
        response: {
          status: 200,
          headers: '',
          body: { result: 'foo' }
        }
      }
    }
  }

  beforeEach(() => {
    sdkFetch = new SDKFetch()
    sdkFetch.setAPIHost(apiHost)
    sdkAsyncJob = new SDKAsyncJob(sdkFetch)
    fetchMock.mock(urlMatcher, {
      timeout: true,
      readyKey: '233'
    })
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('should call "onFulfilled" if job finished', function* () {
    fetchMock.mock(pollingUrlMatcher, successResponse)

    const callback = sinon.spy((res: any) => expect(res.result).to.equal('foo'))

    yield sdkAsyncJob.get<{ result: string }>(path, void 0, {
      onFulfilled: callback
    })
      .subscribeOn(Scheduler.asap)

    expect(callback).to.be.calledOnce
  })

  it('should call "onFulfilled" if job finished on polling', function* () {
    let pollTimes = 0
    fetchMock.mock(pollingUrlMatcher, () => {
      if (pollTimes === 1) {
        return successResponse
      }
      pollTimes++
      return {
        result: {
          '233': {
            isDone: false
          }
        }
      }
    })

    const callback = sinon.spy((res: any) => expect(res.result).to.equal('foo'))

    yield sdkAsyncJob.get<{ result: string }>(path, void 0, {
      onFulfilled: callback,
      pollingOptions: {
        interval: 10,
      }
    })
      .subscribeOn(Scheduler.asap)

    expect(callback).to.be.calledOnce
  })

  it('should call "onPending" if needs wait', function* () {
    fetchMock.mock(pollingUrlMatcher, successResponse)

    const callback = sinon.spy(() => void 0)

    yield sdkAsyncJob.get<{ result: string }>(path, void 0, {
      onPending: callback
    })
      .subscribeOn(Scheduler.asap)

    expect(callback).to.be.calledOnce
  })

  it('should call "onRejected" if job failed', function* (this: any) {
    this.timeout(1000 * 60)
    fetchMock.mock(pollingUrlMatcher, {
      result: {
        '233': {
          isDone: false
        }
      }
    })

    const callback = sinon.spy(() => void 0)

    yield sdkAsyncJob.get<{ result: string }>(path, void 0, {
      onRejected: callback,
      pollingOptions: {
        interval: 100,
        maxTimes: 1,
      }
    })
      .subscribeOn(Scheduler.asap)
      .catch((_e: Error) => {
        return of(null)
      })

    expect(callback).to.be.calledOnce
  })

  it('should throw error when exceed max polling times', function* (this: any) {
    this.timeout(1000 * 60)
    fetchMock.mock(pollingUrlMatcher, {
      result: {
        '233': {
          isDone: false
        }
      }
    })

    yield sdkAsyncJob.get<{ result: string }>(path, void 0, {
      pollingOptions: {
        interval: 100,
        maxTimes: 1,
      }
    })
      .subscribeOn(Scheduler.asap)
      .catch((e: Error) => {
        expect(e.message).to.equal('Async job polling failed')
        return of(null)
      })
  })
})
