import { describe, before, beforeEach, it, afterEach, after } from 'tman'
import { expect } from 'chai'
import { Scheduler } from 'rxjs'
import { SDKFetch } from '../'
import {
  getAllOrganizationProjects,
  getJoinedOrganizationProjects,
  getPublicOrganizationProjects,
  getStarredOrganizationProjects,
  getUngroupedOrganizationProjects
} from '../../src/apis/organization/projects'

const fetchMock = require('fetch-mock')

describe('get organization projects', () => {
  describe('fetch apis', () => {

    let sdkFetch: SDKFetch
    let projects: any[]
    const sampleOrgId = '56f0d51e3cd13a5b537c3a12'
    const getOrganizationProjectsFns = () => [
      { fn: getAllOrganizationProjects, namespace: 'all' },
      { fn: getJoinedOrganizationProjects, namespace: 'joined' },
      { fn: getPublicOrganizationProjects, namespace: 'public' },
      { fn: getStarredOrganizationProjects, namespace: 'starred' },
      { fn: getUngroupedOrganizationProjects, namespace: 'ungrouped' }
    ]

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
        { _id: 'A', tagId: '1', namespaces: ['all'] },
        { _id: 'B', tagId: '2', namespaces: ['all', 'joined'] },
        { _id: 'C', tagId: '2', namespaces: ['all', 'public'] },
        { _id: 'D', tagId: '2', namespaces: ['all', 'starred'] },
        { _id: 'E', tagId: '2', namespaces: ['all', 'ungrouped'] },
        { _id: 'F', tagId: '3', namespaces: ['all', 'joined', 'starred'] },
        { _id: 'G', tagId: '3', namespaces: ['all', 'joined', 'ungrouped'] },
        { _id: 'H', tagId: '4', namespaces: ['all', 'joined', 'public', 'starred'] },
        { _id: 'I', tagId: '3', namespaces: ['all', 'public', 'starred'] },
        { _id: 'J', tagId: '3', namespaces: ['all', 'starred', 'ungrouped'] },
      ]
    })

    afterEach(() => {
      fetchMock.restore()
    })

    getOrganizationProjectsFns().forEach(({ fn, namespace }) => {
      it(`${fn.name} should make correctly formatted request to target url and return response as it is`, function* () {
        const expectedUrl = `/organizations/${sampleOrgId}/projects/${namespace}?_=666`
        const expectedResponse = projects.filter(({ namespaces }) => new Set(namespaces).has(namespace))

        fetchMock.getOnce(expectedUrl, expectedResponse)

        yield fn.call(sdkFetch, sampleOrgId)
          .subscribeOn(Scheduler.asap)
          .do((x: any) => {
            expect(x).to.deep.equal(expectedResponse)
          })
      })
    })

    it('getOrganizationProjectByTagId should make correctly formatted request to target url and return response as it is', function* () {
      const sampleTagId = '3'
      const expectedUrl = `/organizations/${sampleOrgId}/projecttags/${sampleTagId}/projects?_=666`
      const expectedResponse = projects.filter(({ tagId }) => tagId === sampleTagId)

      fetchMock.getOnce(expectedUrl, expectedResponse)

      yield sdkFetch.getOrganizationProjectsByTagId(sampleOrgId, sampleTagId)
        .subscribeOn(Scheduler.asap)
        .do((x: any) => {
          expect(x).to.deep.equal(expectedResponse)
        })
    })

  })
})
