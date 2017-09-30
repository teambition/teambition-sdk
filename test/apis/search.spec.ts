import { describe, before, beforeEach, it, afterEach, after } from 'tman'
import { expect } from 'chai'
import { Scheduler } from 'rxjs'
import {
  searchMembersInTeam,
  searchMembersInProject,
  searchMembersInOrganization,
  searchMembersInGroup,
  ScopeType,
  buildPath as buildPathForMemberSearching
} from '../../src/apis/search/members'
import { SDKFetch } from '../'

const fetchMock = require('fetch-mock')

describe('search for members', () => {
  describe('buildPath', () => {
    it('should build global member search on {}', () => {
      expect(buildPathForMemberSearching({})).to.equal('members/search')
    })

    it('should return null on invalid scope', () => {
      [
        { id: '58de087921efc137f43cef3c' },
        { type: ScopeType.Organization },
        { id: '58de087921efc137f43cef3c', type: -1 },
      ].forEach((scope: any) => {
        expect(buildPathForMemberSearching(scope)).to.be.null
      })
    })

    it('should build correct path for each type of scopes', () => {
      const sampleId = '58de087921efc137f43cef3c'
      expect(buildPathForMemberSearching({
        type: ScopeType.Team,
        id: sampleId
      })).to.equal(`teams/${sampleId}/members/search`)

      expect(buildPathForMemberSearching({
        type: ScopeType.Project,
        id: sampleId
      })).to.equal(`projects/${sampleId}/members/search`)

      expect(buildPathForMemberSearching({
        type: ScopeType.Organization,
        id: sampleId
      })).to.equal(`organizations/${sampleId}/members/search`)

      expect(buildPathForMemberSearching({
        type: ScopeType.Group,
        id: sampleId
      })).to.equal(`groups/${sampleId}/members/search`)
    })
  })

  describe('apis', () => {

    let sdkFetch: SDKFetch
    let allMembers: any
    const sampleId = '58de087921efc137f43cef3c'
    const searchMembersInScopeFns = () => [
      { fn: searchMembersInTeam, namespace: 'teams' },
      { fn: searchMembersInProject, namespace: 'projects' },
      { fn: searchMembersInOrganization, namespace: 'organizations' },
      { fn: searchMembersInGroup, namespace: 'groups' },
    ]

    before(() => {
      SDKFetch.fetchTail = '666'
    })

    after(() => {
      SDKFetch.fetchTail = undefined
    })

    beforeEach(() => {
      sdkFetch = new SDKFetch()
      sdkFetch.setAPIHost('') // 下面的测试不关心 API host 设置
      allMembers = [
        {
          _id: '55c02018fd0360a44c93ff97',
          name: '宝宝摔倒了',
          avatarUrl: 'http://striker.project.ci/thumbnail/010u39ad2e6022ef3ac616c42a46625095ab/w/200/h/200',
          email: '123@123.com'
        },
        {
          _id: '585cbb213e6b5a63f259a23d',
          name: '宝宝',
          avatarUrl: 'http://striker.project.ci/thumbnail/010r5c002c5205b60acfc42386bfa98cac1f/w/200/h/200',
          email: 'test1229@test.com'
        }
      ]
    })

    afterEach(() => {
      fetchMock.restore()
    })

    searchMembersInScopeFns().forEach(({ fn, namespace }) => {
      it(`${fn.name} should handle empty search string correctly`, function* () {
        const expectedResultSet: any[] = allMembers
        fetchMock.getOnce(`/${namespace}/${sampleId}/members/search?q=&_=666`, expectedResultSet)

        yield fn.call(sdkFetch, sampleId as any, '')
          .subscribeOn(Scheduler.asap)
          .do((x: any) => {
            expect(x).to.deep.equal(expectedResultSet)
          })
      })
    })

    searchMembersInScopeFns().forEach(({ fn, namespace }) => {
      it(`${fn.name} should return empty result set as it is`, function* () {
        const expectedResultSet: any[] = []
        fetchMock.getOnce(`/${namespace}/${sampleId}/members/search?q=nonExistence&_=666`, expectedResultSet)

        yield fn.call(sdkFetch, sampleId as any, 'nonExistence')
          .subscribeOn(Scheduler.asap)
          .do((x: any) => {
            expect(x).to.deep.equal(expectedResultSet)
          })
      })
    })

    searchMembersInScopeFns().forEach(({ fn, namespace }) => {
      it(`${fn.name} should handle normal cases correctly`, function* () {
        const expectedResultSet: any[] = allMembers.slice(0, 1)
        fetchMock.getOnce(`/${namespace}/${sampleId}/members/search?q=shuai&_=666`, expectedResultSet)

        yield fn.call(sdkFetch, sampleId as any, 'shuai')
          .subscribeOn(Scheduler.asap)
          .do((x: any) => {
            expect(x).to.deep.equal(expectedResultSet)
          })
      })
    })

    it('searchMembers should handle empty search string correctly', function* () {
      fetchMock.get('/members/search?q=&_=666', allMembers)

      yield sdkFetch.searchMembers('')
        .subscribeOn(Scheduler.asap)
        .do((x) => {
          expect(x).to.deep.equal(allMembers)
        })
    })

    it('searchMembers should return empty result set as it is', function* () {
      fetchMock.get('/members/search?q=nonExistence&_=666', [])

      yield sdkFetch.searchMembers('nonExistence')
        .subscribeOn(Scheduler.asap)
        .do((x) => {
          expect(x).to.deep.equal([])
        })
    })

    it('searchMembers should handle normal cases correctly', function* () {
      const expectedResultSet = allMembers.slice(0, 1)
      fetchMock.get('/members/search?q=shuai&_=666', expectedResultSet)

      yield sdkFetch.searchMembers('shuai')
        .subscribeOn(Scheduler.asap)
        .do((x) => {
          expect(x).to.deep.equal(expectedResultSet)
        })
    })
  })
})
