import { describe, before, beforeEach, afterEach, it, after } from 'tman'
import { Scheduler, Observable } from 'rxjs'
import { expect } from 'chai'

import { SDKFetch, createSdk, SDK } from '../'
import { expectToDeepEqualForFieldsOfTheExpected } from '../utils'
import { CustomFieldId } from 'teambition-types'
import { customField } from '../fixtures/customfields.fixture'

const fetchMock = require('fetch-mock')

describe('CustomFieldApi request spec: ', () => {
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

  it('should return a CustomField', function*() {
    const customFieldId = customField._id as CustomFieldId
    const url = `/customfields/${customFieldId}?_=666`

    fetchMock.once(url, customField)

    yield sdkFetch
      .getCustomField(customFieldId)
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.deep.equal(customField)
      })
  })
})

describe('CustomFieldApi spec: ', () => {
  let sdk: SDK

  beforeEach(() => {
    sdk = createSdk()
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('should return an empty array', function*() {
    const customFieldId = customField._id as CustomFieldId

    fetchMock.once('*', customField)

    yield sdk
      .getCustomField(customFieldId, { req: Observable.of([]) })
      .values()
      .subscribeOn(Scheduler.asap)
      .do((result) => {
        expect(result).to.be.empty
        expect(fetchMock.called()).to.be.false
      })
  })

  it('should return a CustomField', function*() {
    const customFieldId = customField._id as CustomFieldId

    fetchMock.once('*', customField)

    yield sdk
      .getCustomField(customFieldId)
      .values()
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        expectToDeepEqualForFieldsOfTheExpected(customField, result)
        expect(fetchMock.called()).to.be.true
      })
  })
})
