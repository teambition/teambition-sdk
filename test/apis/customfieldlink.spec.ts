import { describe, before, beforeEach, afterEach, it, after } from 'tman'
import { Scheduler, Observable } from 'rxjs'
import { expect } from 'chai'

import { SDKFetch, createSdk, SDK } from '../'
import { customFieldLink } from '../fixtures/customfieldlinks.fixture'
import { mock, expectToDeepEqualForFieldsOfTheExpected } from '../utils'
import { ProjectId, CustomFieldId, UserSnippet } from 'teambition-types'
import { CustomFieldLinkSchema } from '../../src'

const fetchMock = require('fetch-mock')

describe('CustomFieldLinkApi request spec: ', () => {
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

  it('should return a CustomFieldLink array', function*() {
    const projectId = customFieldLink._projectId as ProjectId
    const customFieldLinks = [customFieldLink]
    const url = `/projects/${projectId}/customfieldlinks?boundType=application&_=666`

    fetchMock.once(url, customFieldLinks)

    yield sdkFetch
      .getCustomFieldLinks(projectId, 'application')
      .subscribeOn(Scheduler.asap)
      .do((result) => expect(result).to.deep.equal(customFieldLinks))
  })
})

describe('CustomFieldLinkApi spec: ', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, schedule?: number | Promise<any>) => void

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
  })

  it('should return a CustomFieldLink array', function*() {
    const projectId = customFieldLink._projectId as ProjectId
    const locker = {
      _id: 'mock-locker-id',
      name: '',
      avatarUrl: ''
    } as UserSnippet
    const customFieldLinks = [
      { ...customFieldLink, _lockerId: locker._id, locker }
    ]
    mockResponse(customFieldLinks)

    yield sdk
      .getCustomFieldLinks(projectId, 'application')
      .values()
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        expectToDeepEqualForFieldsOfTheExpected(result, customFieldLinks[0])
        expect(result.locker).to.have.property('_id')
      })
  })

  it('should return a CustomFieldLink derived from CustomField', function*() {
    const locker = {
      _id: 'mock-locker-id',
      name: '',
      avatarUrl: ''
    } as UserSnippet
    const customFieldLinks: CustomFieldLinkSchema[] = [
      { ...customFieldLink, _lockerId: locker._id, locker } as any
    ]
    const customFieldId = customFieldLink._customfieldId as CustomFieldId

    yield sdk
      .getLinkByCustomFieldId(customFieldId, {
        request: Observable.of(customFieldLinks)
      })
      .values()
      .subscribeOn(Scheduler.asap)
      .do(([result]) => {
        expectToDeepEqualForFieldsOfTheExpected(result, customFieldLinks[0])
        expect(result.locker).to.have.property('_id')
      })
  })
})
