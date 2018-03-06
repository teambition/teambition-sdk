import { describe, before, beforeEach, it, afterEach, after } from 'tman'
import { expect } from 'chai'
import { Scheduler } from 'rxjs'
import {
  GetPersonalProjectsQueryParams
} from '../../src/apis/project/personal'
import { SDKFetch, createSdk, SDK } from '../'
import { normalProject } from '../fixtures/projects.fixture'
import { mock, expectToDeepEqualForFieldsOfTheExpected } from '../utils'

const fetchMock = require('fetch-mock')

describe('get personal projects', () => {
  describe('fetch api', () => {

    let sdkFetch: SDKFetch
    let projects: any[]

    before(() => {
      SDKFetch.fetchTail = '666'
    })

    after(() => {
      SDKFetch.fetchTail = undefined
    })

    beforeEach(() => {
      sdkFetch = new SDKFetch()
      sdkFetch.setAPIHost('')
      projects = [
        { _id: 'A' },
        { _id: 'B', isArchived: true },
        { _id: 'C', isArchived: true, isStar: true },
        { _id: 'D', isStar: true }
      ]
    })

    afterEach(() => {
      fetchMock.restore()
    })

    const sampleParams: Partial<GetPersonalProjectsQueryParams>[] = [
      {},
      { isArchived: true },
      { isArchived: false },
      { isStar: true },
      { isStar: false },
      { isArchived: true, isStar: true },
      { isArchived: true, isStar: false },
      { isArchived: false, isStar: false },
      { isArchived: false, isStar: true }
    ]

    sampleParams.forEach(({ isArchived, isStar }) => {

      const isArchivedMsg = isArchived === undefined ? '' : `isArchived=${isArchived}`
      const isStarMsg = isStar === undefined ? '' : `isStar=${isStar}`

      it(`should be able to get ${isArchivedMsg} ${isStarMsg} personal projects`, function* () {
        let expectedUrl = '/projects/personal?'
        if (!isArchivedMsg && !isStarMsg) {
          expectedUrl += '_=666'
        } else if (isArchivedMsg && isStarMsg) {
          expectedUrl += `${isArchivedMsg}&${isStarMsg}&_=666`
        } else if (isArchivedMsg) {
          expectedUrl += `${isArchivedMsg}&_=666`
        } else if (isStarMsg) {
          expectedUrl += `${isStarMsg}&_=666`
        }
        const expectedResponse = projects.filter((x: any) => x.isArchived == isArchived && x.isStar == isStar)

        fetchMock.getOnce(expectedUrl, expectedResponse)

        const params = {
          ...(isArchived === undefined ? {} : { isArchived }),
          ...(isStar === undefined ? {} : { isStar })
        }

        yield sdkFetch.getPersonalProjects(params as any)
          .subscribeOn(Scheduler.asap)
          .do((x: any) => {
            expect(x).to.deep.equal(expectedResponse)
          })
      })
    })
  })
})

describe('ProjectApi request spec: ', () => {
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

  it('getProject() should return a project response', function* () {
    const project = normalProject
    const projectId = project._id
    const url = `/projects/${projectId}?_=666`

    fetchMock.getOnce(url, project)

    yield sdkFetch.getProject(projectId)
      .subscribeOn(Scheduler.asap)
      .do((result) => expect(result).to.deep.equal(project))
  })
})

describe('ProjectApi spec: ', () => {

  let sdk: SDK
  let mockResponse: <T>(m: T, schedule?: number | Promise<any>) => void

  beforeEach(() => {
    sdk = createSdk()
    mockResponse = mock(sdk)
  })

  it('should return a project', function* () {
    const fixture = normalProject
    mockResponse(fixture)

    yield sdk.getProject(fixture._id)
      .values()
      .subscribeOn(Scheduler.asap)
      .do(([project]) => {
        expectToDeepEqualForFieldsOfTheExpected(project, fixture, 'organization', 'role', 'creator', 'isTemplate')
      })
  })
})
