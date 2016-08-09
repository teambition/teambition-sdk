'use strict'
import * as chai from 'chai'
import * as Rx from 'rxjs'
import { MemberSchema } from '../index'
import { MemberAPI, Backend, apihost } from '../index'
import { members } from '../../mock/members'
import { projectMembers } from '../../mock/projectMembers'
import { organizations } from '../../mock/organizations'
import { notInclude, flush } from '../utils'

const expect = chai.expect

export default describe('member api test', () => {
  let Member: MemberAPI
  let httpBackend: Backend

  const member = members[0]

  beforeEach(() => {
    flush()
    Member = new MemberAPI()
    httpBackend = new Backend()
    httpBackend
      .whenGET(`${apihost}projects/${member._boundToObjectId}/members`)
      .respond(JSON.stringify(members))
  })

  after(() => {
    httpBackend.restore()
  })

  it('get organization members should ok', (done: Function) => {
    const id = organizations[0]._id

    httpBackend
      .whenGET(`${apihost}V2/organizations/${id}/members`)
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
      .whenGET(`${apihost}V2/organizations/${id}/members`)
      .respond(members)

    Member.getOrgMembers(id)
      .subscribe()

    Member.getOrgMembers(id)
      .subscribeOn(Rx.Scheduler.async, global.timeout1)
      .subscribe(members => {
        expect(members).to.instanceof(Array)
        done()
      })

    httpBackend.flush()
  })

  it ('getMembers from project should ok', done => {
    Member.getProjectMembers(member._boundToObjectId)
      .subscribe(data => {
        expect(data).to.be.instanceof(Array)
        expect(data.length).to.equal(members.length)
        done()
      })

    httpBackend.flush()
  })

  it('get members from project cache should ok', done => {
    Member.getProjectMembers(member._boundToObjectId)
      .subscribe()

    Member.getProjectMembers(member._boundToObjectId)
      .subscribeOn(Rx.Scheduler.async, global.timeout1)
      .subscribe(data => {
        expect(data).to.be.instanceof(Array)
        expect(data.length).to.equal(members.length)
        done()
      })

    httpBackend.flush()
  })

  it('delete member from project should ok', done => {

    httpBackend
      .whenDELETE(`${apihost}members/${member._memberId}`)
      .respond({})

    Member.getProjectMembers(member._boundToObjectId)
      .skip(1)
      .subscribe(data => {
        expect(data.length).to.equal(members.length - 1)
        expect(notInclude(data, member)).to.be.true
        done()
      })

    Member.deleteMember(member._memberId)
      .subscribeOn(Rx.Scheduler.async, global.timeout1)
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

    httpBackend.whenGET(`${apihost}projects/${projectId}/members`)
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
      .subscribeOn(Rx.Scheduler.async, global.timeout1)
      .subscribe()

    httpBackend.flush()
  })

  it('delete and add project members should ok', done => {
    const projectId = member._boundToObjectId
    const mockEmails = projectMembers.map(member => member.email)

    httpBackend.whenGET(`${apihost}projects/${projectId}/members`)
      .respond(JSON.stringify(members))

    httpBackend.whenPOST(`${apihost}v2/projects/${projectId}/members`, {
      email: mockEmails
    })
      .respond(JSON.stringify(projectMembers))

    httpBackend
      .whenDELETE(`${apihost}members/${member._memberId}`)
      .respond({})

    Member.getProjectMembers(projectId)
      .skip(2)
      .subscribe(r => {
        expect(r.length).to.equal(members.length + projectMembers.length - 1)
        done()
      })

    Member.deleteMember(member._memberId)
      .subscribeOn(Rx.Scheduler.async, global.timeout1)
      .subscribe()

    Member.addMembers(projectId, mockEmails)
      .subscribeOn(Rx.Scheduler.async, global.timeout2)
      .subscribe()

    httpBackend.flush()
  })
})
