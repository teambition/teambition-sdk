'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import { Observable } from 'rxjs'
import { MemberSchema } from '../index'
import { MemberAPI, Backend, apihost, clone, BaseFetch, uuid, Utils } from '../index'
import { members } from '../../mock/members'
import { projectMembers } from '../../mock/projectMembers'
import { organizations } from '../../mock/organizations'
import { notInclude, flush, expectDeepEqual } from '../utils'

const expect = chai.expect
chai.use(sinonChai)

export default describe('member api test', () => {
  let Member: MemberAPI
  let httpBackend: Backend
  let spy: Sinon.SinonSpy

  const member = members[0]

  beforeEach(() => {
    flush()
    Member = new MemberAPI()
    httpBackend = new Backend()
    spy = sinon.spy(BaseFetch.fetch, 'get')
    httpBackend
      .whenGET(`${apihost}projects/${member._boundToObjectId}/members?page=1&count=30`)
      .respond(JSON.stringify(members.slice(0, 30)))
  })

  after(() => {
    httpBackend.restore()
  })

  afterEach(() => {
    BaseFetch.fetch.get['restore']()
  })

  it('should get one', function* () {

    const member = <MemberSchema>{
      _id: <any>uuid(),
      _memberId: <any>uuid()
    }
    const memberId = member._memberId

    httpBackend
      .whenGET(`${apihost}members/${memberId}`)
      .respond(JSON.stringify(member))

    const signal = Member.getOne(memberId)

    yield signal.take(1)

    yield signal.take(1)
      .do(data => {
        expectDeepEqual(data, member)
        expect(spy.calledOnce).to.be.true
      })
  })

  it('should get one project member', function* () {

    const mockMember = projectMembers[0]
    const count = 5
    const projectId = uuid()
    const members = <MemberSchema[]>[]
    for (let i = 0; i < count; i ++) {
      members.push(<any>Utils.assign(Utils.clone(mockMember), {
        _id: uuid(),
        _memberId: uuid(),
        _boundToObjectId: projectId,
        boundToObjectType: 'project'
      }))
    }
    const member = members[0]
    const memberId = member._memberId

    httpBackend.whenGET(`${apihost}projects/${projectId}/members?page=1&count=30`)
      .respond(JSON.stringify(members))

    const signalOne = Member.getProjectMembers(<any>projectId)
    const signalTwo = Member.getOne(memberId)

    yield signalOne.take(1)
    yield signalTwo.take(1)

    yield signalOne.take(1)
      .do(members => {
        expect(members.length).to.be.equal(count)
        expectDeepEqual(members[0], member)
      })

    yield signalTwo.take(1)
      .do(data => {
        expectDeepEqual(data, member)
        expect(spy.calledOnce).to.be.true
      })
  })

  it('should get one organization member', function* () {

    const mockMember = projectMembers[0]
    const count = 5
    const organizationId = uuid()
    const members = <MemberSchema[]>[]
    for (let i = 0; i < count; i ++) {
      members.push(<any>Utils.assign(Utils.clone(mockMember), {
        _id: uuid(),
        _memberId: uuid(),
        _boundToObjectId: organizationId,
        boundToObjectType: 'organization'
      }))
    }
    const member = members[0]
    const memberId = member._memberId

    httpBackend.whenGET(`${apihost}V2/organizations/${organizationId}/members?page=1&count=30`)
      .respond(JSON.stringify(members))

    const signalOne = Member.getOrgMembers(<any>organizationId)
    const signalTwo = Member.getOne(memberId)

    yield signalOne.take(1)
    yield signalTwo.take(1)

    yield signalOne.take(1)
      .do(members => {
        expect(members.length).to.be.equal(count)
        expectDeepEqual(members[0], member)
      })

    yield signalTwo.take(1)
      .do(data => {
        expectDeepEqual(data, member)
        expect(spy.calledOnce).to.be.true
      })
  })

  it('get organization members should ok', function* () {
    const id = organizations[0]._id

    httpBackend
      .whenGET(`${apihost}V2/organizations/${id}/members?page=1&count=30`)
      .respond(members)

    yield Member.getOrgMembers(<any>id)
      .take(1)
      .forEach(members => {
        expect(members).to.instanceof(Array)
      })

  })

  it('get organization members from cache should ok', function* () {
    const id = organizations[0]._id

    httpBackend
      .whenGET(`${apihost}V2/organizations/${id}/members?page=1&count=30`)
      .respond(members.slice(0, 30))

    const stream = Member.getOrgMembers(<any>id)
      .publish()
      .refCount()

    yield stream.take(1)

    yield Member.getOrgMembers(<any>id)
      .take(1)
      .forEach(members => {
        expect(members).to.instanceof(Array)
        expect(spy).to.be.calledOnce
      })
  })

  it('get project members page2 should ok', function* () {
    httpBackend
      .whenGET(`${apihost}projects/${member._boundToObjectId}/members?page=2&count=30`)
      .respond(members.slice(30))

    const stream = Member.getProjectMembers(<any>member._boundToObjectId)
      .publish()
      .refCount()

    yield stream.take(1)

    stream.skip(1)
      .forEach(r => {
        expect(r.length).to.equal(members.length)
      })

    yield Member.getProjectMembers(<any>member._boundToObjectId, 2)
      .take(1)

  })

  it ('getMembers from project should ok', function* () {
    const stream = Member.getProjectMembers(<any>member._boundToObjectId)
      .publish()
      .refCount()

    yield stream.take(1).forEach(data => {
      expect(data).to.be.instanceof(Array)
      expect(data.length).to.equal(30)
    })

  })

  it('get members from project cache should ok', function* () {
    const stream = Member.getProjectMembers(<any>member._boundToObjectId)
      .publish()
      .refCount()

    yield stream.take(1)

    yield Member.getProjectMembers(<any>member._boundToObjectId)
      .take(1)
      .forEach(data => {
        expect(data).to.be.instanceof(Array)
        expect(data.length).to.equal(30)
        expect(spy).to.be.calledOnce
      })

  })

  it ('get members from project page2 should ok', function* () {
    const id = member._boundToObjectId

    httpBackend
      .whenGET(`${apihost}V2/organizations/${id}/members?page=1&count=30`)
      .respond(members.slice(0, 30))

    httpBackend
      .whenGET(`${apihost}V2/organizations/${id}/members?page=2&count=30`)
      .respond(members.slice(30))

    const stream = Member.getOrgMembers(<any>id)
      .publish()
      .refCount()

    yield stream.take(1)

    stream.skip(1)
      .forEach(r => {
        expect(r.length).to.equal(members.length)
      })

    yield Member.getOrgMembers(<any>id, 2).take(1)
  })

  it('delete member from project should ok', function* () {

    httpBackend
      .whenDELETE(`${apihost}members/${member._memberId}`)
      .respond({})

    const stream = Member.getProjectMembers(<any>member._boundToObjectId)
      .publish()
      .refCount()

    yield stream.take(1)

    stream.skip(1)
      .forEach(data => {
        expect(data.length).to.equal(30 - 1)
        expect(notInclude(data, member)).to.be.true
      })

    yield Member.deleteMember(<any>member._memberId)
  })

  it('add members before getting members', function* () {
    const projectId = projectMembers[0]._boundToObjectId
    const mockEmails = projectMembers.map(member => member.email)

    httpBackend.whenPOST(`${apihost}v2/projects/${projectId}/members`, {
        email: mockEmails
      })
      .respond(JSON.stringify(projectMembers))

    httpBackend.whenPOST(`${apihost}v2/projects/${projectId}/members`, {
        email: mockEmails
      })
      .respond(JSON.stringify(projectMembers))

    const stream = Member.addMembers(<any>projectId, mockEmails)
      .publish()
      .refCount()

    yield stream.take(1)

    yield Member.addMembers(<any>projectId, mockEmails)
      .forEach((members: any) => {
        expect(members.length).to.be.equal(projectMembers.length)
      })

  })

  it('add members to project should ok', function* () {
    const projectId = projectMembers[0]._boundToObjectId
    const mockEmails = projectMembers.map(member => member.email)

    httpBackend.whenGET(`${apihost}projects/${projectId}/members?page=1&count=30`)
      .respond(JSON.stringify(members.slice(0, 30)))

    httpBackend.whenPOST(`${apihost}v2/projects/${projectId}/members`, {
      email: mockEmails
    })
      .respond(JSON.stringify(projectMembers))

    const stream = Member.getProjectMembers(<any>projectId)
      .publish()
      .refCount()

    yield stream.take(1)

    stream.skip(1)
      .forEach(r => {
        expect(r.length).to.equal(30 + projectMembers.length)
      })

    yield Member.addMembers(<any>projectId, mockEmails)
  })

  it('add project members multiple times', function* () {
    const projectId = projectMembers[0]._boundToObjectId
    const limit = Math.floor(projectMembers.length / 3)
    const chunks = []
    let start = 0
    while (projectMembers.length > start) {
      chunks.push(projectMembers.slice(start, start + limit))
      start += limit
    }

    chunks.forEach(chunkProjectMembers => {
      const emails = chunkProjectMembers.map(member => member.email)
      httpBackend.whenPOST(
        `${apihost}v2/projects/${projectId}/members`,
          {
            email: emails
          }
        )
        .respond(JSON.stringify(chunkProjectMembers))
    })

    httpBackend.whenGET(`${apihost}projects/${projectId}/members?page=1&count=30`)
      .respond(JSON.stringify(members))

    const stream = Member.getProjectMembers(<any>projectId)
      .publish()
      .refCount()

    yield stream.take(1)

    stream.skip(1)
      .forEach(finalMembers => {
        expect(finalMembers.length).to.be.equal(members.length + projectMembers.length)
      })

    yield Observable.from(chunks.map(chunkProjectMembers => {
      const emails = chunkProjectMembers.map(member => member.email)
      return Member.addMembers(<any>projectId, emails)
    }))
      .mergeMap<any>(r => r)
      .mergeAll()
      .toArray()
      .forEach(r => {
        expect(r.length).to.be.equal(projectMembers.length)
      })

  })

  it('delete and add project members should ok', function* () {
    const projectId = member._boundToObjectId
    const mockEmails = projectMembers.map(member => member.email)
    const addResponse = clone(projectMembers).map(v => {
      v._boundToObjectId = projectId
      return v
    })

    httpBackend.whenGET(`${apihost}projects/${projectId}/members?page=1&count=30`)
      .respond(JSON.stringify(members.slice(0, 30)))

    httpBackend.whenPOST(`${apihost}v2/projects/${projectId}/members`, {
      email: mockEmails
    })
      .respond(JSON.stringify(addResponse))

    httpBackend
      .whenDELETE(`${apihost}members/${member._memberId}`)
      .respond({})

    const stream = Member.getProjectMembers(<any>projectId)
      .publish()
      .refCount()

    yield stream.take(1)

    stream.skip(2)
      .forEach(r => {
        expect(r.length).to.equal(30 + projectMembers.length - 1)
      })

    yield Member.deleteMember(<any>member._memberId)

    yield Member.addMembers(<any>projectId, mockEmails)
  })

  it('get all org members 50 should ok', function* () {
    const id = organizations[0]._id

    httpBackend
      .whenGET(`${apihost}V2/organizations/${id}/members?page=1&count=1000`)
      .respond(members)

    yield Member.getAllOrgMembers(<any>id)
      .take(1)
      .forEach(r => {
        expect(r.length).to.equal(members.length)
      })
  })

  it('get all org members 2900 should ok', function* () {
    const id = organizations[0]._id
    const mockMembers = new Array(2900)
      .fill(0)
      .map((r, index) => {
        const result = clone(members[0])
        result._id = result._id + 'index'
        return result
      })

    const page1 = mockMembers.slice(0, 1000)
    const page2 = mockMembers.slice(1000, 2000)
    const page3 = mockMembers.slice(2000)

    httpBackend
      .whenGET(`${apihost}V2/organizations/${id}/members?page=1&count=1000`)
      .respond(JSON.stringify(page1))

    httpBackend
      .whenGET(`${apihost}V2/organizations/${id}/members?page=2&count=1000`)
      .respond(JSON.stringify(page2))

    httpBackend
      .whenGET(`${apihost}V2/organizations/${id}/members?page=3&count=1000`)
      .respond(JSON.stringify(page3))

    const stream = Member.getAllOrgMembers(<any>id)
      .publish()
      .refCount()

    yield stream.take(1)

    yield stream.take(1).forEach(r => {
      expect(r.length).to.equal(mockMembers.length)
      expect(spy).to.be.calledThrice
    })

  })

  it('get all project members 50 should ok', function* () {
    httpBackend
      .whenGET(`${apihost}projects/${member._boundToObjectId}/members?page=1&count=1000`)
      .respond(JSON.stringify(projectMembers))

    yield Member.getAllProjectMembers(<any>member._boundToObjectId)
      .take(1)
      .forEach(r => {
        expect(r.length).to.equal(projectMembers.length)
      })

  })

  it('get all project members 2900 should ok',  function* () {
    const mockMembers = new Array(2900)
      .fill(0)
      .map((r, index) => {
        const result = clone(projectMembers[0])
        result._id = result._id + 'index'
        return result
      })

    const page1 = mockMembers.slice(0, 1000)
    const page2 = mockMembers.slice(1000, 2000)
    const page3 = mockMembers.slice(2000)

    httpBackend
      .whenGET(`${apihost}projects/${member._boundToObjectId}/members?page=1&count=1000`)
      .respond(JSON.stringify(page1))

    httpBackend
      .whenGET(`${apihost}projects/${member._boundToObjectId}/members?page=2&count=1000`)
      .respond(JSON.stringify(page2))

    httpBackend
      .whenGET(`${apihost}projects/${member._boundToObjectId}/members?page=3&count=1000`)
      .respond(JSON.stringify(page3))

    yield Member.getAllProjectMembers(<any>member._boundToObjectId)
      .take(1)
      .forEach(r => {
        expect(r.length).to.equal(mockMembers.length)
        expect(spy).to.be.calledThrice
      })
  })

})
