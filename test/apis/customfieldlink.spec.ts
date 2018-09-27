import { describe, before, beforeEach, afterEach, it, after } from 'tman'
import { expect } from 'chai'

import { SDKFetch, createSdk, SDK } from '../'
import { customFieldLink } from '../fixtures/customfieldlinks.fixture'
import { mock, expectToDeepEqualForFieldsOfTheExpected, tapAsap } from '../utils'
import { ProjectId } from 'teambition-types'

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

  it('should return a CustomFieldLink array', function* () {
    const projectId = customFieldLink._projectId as ProjectId
    const customFieldLinks = [customFieldLink]
    const url = `/projects/${projectId}/customfieldlinks?boundType=application&_=666`

    fetchMock.once(url, customFieldLinks)

    yield sdkFetch.getCustomFieldLinks(projectId, 'application')
      .pipe(tapAsap(
        (result) => expect(result).to.deep.equal(customFieldLinks))
      )
  })
})

describe('CustomFieldLinkApi spec: ', () => {
  let sdk: SDK
  let mockResponse: <T>(m: T, schedule?: number | Promise<any>) => void

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
  })

  it('should return a CustomFieldLink array', function* () {
    const projectId = customFieldLink._projectId as ProjectId
    const customFieldLinks = [customFieldLink]
    mockResponse(customFieldLinks)

    yield sdk.getCustomFieldLinks(projectId, 'application')
      .values()
      .pipe(tapAsap(
        ([ result ]) => expectToDeepEqualForFieldsOfTheExpected(result, customFieldLinks[0])
      ))
  })
})
