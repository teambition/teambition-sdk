'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import { Scheduler, Observable } from 'rxjs'
import { MemberSchema } from '../index'
import { MemberAPI, Backend, apihost, clone, BaseFetch } from '../index'
import { members } from '../../mock/members'
import { projectMembers } from '../../mock/projectMembers'
import { organizations } from '../../mock/organizations'
import { notInclude, flush } from '../utils'

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

  it('get organization members should ok', done => {
    const id = organizations[0]._id

    httpBackend
      .whenGET(`${apihost}V2/organizations/${id}/members?page=1&count=30`)
      .respond(members)

    Member.getOrgMembers(id)
      .subscribe(members => {
        expect(members).to.instanceof(Array)
        done()
      })

    httpBackend.flush()
  })

  it('get organization members from cache should ok', done => {
    const id = organizations[0]._id

    httpBackend
      .whenGET(`${apihost}V2/organizations/${id}/members?page=1&count=30`)
      .respond(members.slice(0, 30))

    Member.getOrgMembers(id)
      .subscribe()

    Member.getOrgMembers(id)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe(members => {
        expect(members).to.instanceof(Array)
        expect(spy).to.be.calledOnce
        done()
      })

    httpBackend.flush()
  })

  it('get project members page2 should ok', done => {
    httpBackend
      .whenGET(`${apihost}projects/${member._boundToObjectId}/members?page=2&count=30`)
      .respond(members.slice(30))

    Member.getProjectMembers(member._boundToObjectId)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(members.length)
        done()
      })

    Member.getProjectMembers(member._boundToObjectId, 2)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it ('getMembers from project should ok', done => {
    Member.getProjectMembers(member._boundToObjectId)
      .subscribe(data => {
        expect(data).to.be.instanceof(Array)
        expect(data.length).to.equal(30)
        done()
      })

    httpBackend.flush()
  })

  it('get members from project cache should ok', done => {
    Member.getProjectMembers(member._boundToObjectId)
      .subscribe()

    Member.getProjectMembers(member._boundToObjectId)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe(data => {
        expect(data).to.be.instanceof(Array)
        expect(data.length).to.equal(30)
        expect(spy).to.be.calledOnce
        done()
      })

    httpBackend.flush()
  })

  it('get members from project page2 should ok', done => {
    const id = member._boundToObjectId

    httpBackend
      .whenGET(`${apihost}V2/organizations/${id}/members?page=1&count=30`)
      .respond(members.slice(0, 30))

    httpBackend
      .whenGET(`${apihost}V2/organizations/${id}/members?page=2&count=30`)
      .respond(members.slice(30))

    Member.getOrgMembers(id)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(members.length)
        done()
      })

    Member.getOrgMembers(id, 2)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('delete member from project should ok', done => {

    httpBackend
      .whenDELETE(`${apihost}members/${member._memberId}`)
      .respond({})

    Member.getProjectMembers(member._boundToObjectId)
      .skip(1)
      .subscribe(data => {
        expect(data.length).to.equal(30 - 1)
        expect(notInclude(data, member)).to.be.true
        done()
      })

    Member.deleteMember(member._memberId)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('add members before getting members', done => {
    const projectId = projectMembers[0]._boundToObjectId
    const mockEmails = projectMembers.map(member => member.email)

    httpBackend.whenPOST(`${apihost}v2/projects/${projectId}/members`, {
        email: mockEmails
      })
      .respond(JSON.stringify(projectMembers))

    Member.addMembers(projectId, mockEmails)
      .subscribe((members: MemberSchema[]) => {
        expect(members.length).to.be.equal(projectMembers.length)
        done()
      })

    httpBackend.flush()
  })

  it('add members to project should ok', done => {
    const projectId = projectMembers[0]._boundToObjectId
    const mockEmails = projectMembers.map(member => member.email)

    httpBackend.whenGET(`${apihost}projects/${projectId}/members?page=1&count=30`)
      .respond(JSON.stringify(members))

    httpBackend.whenPOST(`${apihost}v2/projects/${projectId}/members`, {
      email: mockEmails
    })
      .respond(JSON.stringify(projectMembers))

    Member.getProjectMembers(projectId)
      .skip(1)
      .subscribe(r => {
        expect(r.length).to.equal(members.length + projectMembers.length)
        done()
      })

    Member.addMembers(projectId, mockEmails)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('add project members multiple times', done => {
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

    Observable.combineLatest(
        Member.getProjectMembers(projectId)
          .skip(1),
        Observable.combineLatest(
            chunks.map(chunkProjectMembers => {
              const emails = chunkProjectMembers.map(member => member.email)
              return Member.addMembers(projectId, emails)
            })
          )
          .map(data => {
            return [].concat(...data)
          })
          .subscribeOn(Scheduler.async, global.timeout1)
      )
      .subscribe(([finalMembers, addedMembers]) => {
        expect(finalMembers.length).to.be.equal(members.length + projectMembers.length)
        expect(addedMembers.length).to.be.equal(projectMembers.length)
        done()
      })

    httpBackend.flush()
  })

  it('delete and add project members should ok', done => {
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

    Member.getProjectMembers(projectId)
      .skip(2)
      .subscribe(r => {
        expect(r.length).to.equal(30 + projectMembers.length - 1)
        done()
      })

    Member.deleteMember(member._memberId)
      .subscribeOn(Scheduler.async, global.timeout1)
      .subscribe()

    Member.addMembers(projectId, mockEmails)
      .subscribeOn(Scheduler.async, global.timeout2)
      .subscribe()

    httpBackend.flush()
  })
})
