import { describe, before, beforeEach, afterEach, it, after } from 'tman'
import { Scheduler } from 'rxjs'
import { expect } from 'chai'

import { SDKFetch, createSdk, SDK } from '../'
import { tag } from '../fixtures/tags.fixture'
import { mock, expectToDeepEqualForFieldsOfTheExpected } from '../utils'

const fetchMock = require('fetch-mock')

describe('TagApi request spec: ', () => {
  before(() => {
    SDKFetch.fetchTail = '666'
  })

  after(() => {
    SDKFetch.fetchTail = undefined
  })

  let sdkFetch: SDKFetch

  beforeEach(() => {
    sdkFetch = new SDKFetch()
    sdkFetch.setAPIHost('')
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('should return a Tag array', function* () {
    const projectId = tag._projectId
    const tags = [tag]
    const url = `/tags?_projectId=${projectId}&_=666`

    fetchMock.once(url, tags)

    yield sdkFetch.getTags(projectId)
      .subscribeOn(Scheduler.asap)
      .do((result) => expect(result).to.deep.equal(tags))
  })
})

describe('TagApi spec: ', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, schedule?: number | Promise<any>) => void

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
  })

  it('should return a Tag array', function* () {
    const projectId = tag._projectId
    const tags = [tag]
    mockResponse(tags)

    yield sdk.getTags(projectId)
      .values()
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        expectToDeepEqualForFieldsOfTheExpected(result, tags[0])
      })
  })
})
