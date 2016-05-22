'use strict'
import * as chai from 'chai'
import * as Rx from 'rxjs'
import { MemberAPI, Backend, apihost, clone } from '../index'
import { members } from '../mock/members'
import { organizations } from '../mock/organizations'
import { notInclude, flush } from '../utils'

const expect = chai.expect

export default describe('member api test', () => {
  let Member: MemberAPI
  let httpBackend: Backend
  beforeEach(() => {
    flush()
    Member = new MemberAPI()
    httpBackend = new Backend()
    httpBackend
      .whenGET(`${apihost}projects/projectId/members`)
      .respond(clone(members))
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

  it ('getMembers from project should ok', done => {
    Member.getProjectMembers('projectId')
      .subscribe(data => {
        expect(data).to.be.instanceof(Array)
        expect(data.length).to.equal(members.length)
        done()
      })

    httpBackend.flush()
  })

  it('delete member from project should ok', done => {
    let member = members[0]

    httpBackend
      .whenDELETE(`${apihost}members/${member._id}`)
      .respond({})

    const get = Member.getProjectMembers('projectId')
    const del = Member.deleteMember(member._id)

    get.skip(1)
      .subscribe(data => {
        expect(data.length).to.equal(members.length - 1)
        expect(notInclude(data, member)).to.be.true
        done()
      })

    del.subscribeOn(Rx.Scheduler.async, 10)
      .subscribe()

    httpBackend.flush()
  })
})
