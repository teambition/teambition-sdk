'use strict'
import * as chai from 'chai'
import {MemberAPI, Backend, apihost, clone} from '../index'
import {members} from '../mock/members'
import {organizations} from '../mock/organizations'
import {flushDatabase} from '../utils'

const expect = chai.expect

export default describe('member api test', () => {
  let Member: MemberAPI
  let httpBackend: Backend
  beforeEach(() => {
    Member = new MemberAPI()
    httpBackend = new Backend()
    httpBackend
    .whenGET(`${apihost}/projects/projectId/members`)
    .respond(clone(members))

    flushDatabase()
  })

  it('get organization members should ok', (done: Function) => {
    const id = organizations[0]._id

    httpBackend
    .whenGET(`${apihost}/V2/organizations/${id}/members`)
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
    let memberId = members[0]._id

    httpBackend
    .whenDELETE(`${apihost}/members/${memberId}`)
    .respond({})

    const get = Member.getProjectMembers('projectId')
    const del = _id => Member.deleteMember(_id)

    let times = 0
    get.subscribe(data => {
      switch (++times) {
        case 1:
          expect(data.length).to.equal(members.length)
          break
        case 2:
          expect(data.length).to.equal(members.length - 1)
          let inData = false
          data.forEach((val) => {
            if (val._id === memberId) {
              inData = true
            }
          })
          expect(inData).to.be.false
          done()
          break
      }
    })

    del(memberId).subscribe()

    httpBackend.flush()
  })
})
