'use strict'
import * as chai from 'chai'
import {MemberAPI, Backend, apihost} from '../index'
import Member from '../../../src/schemas/Member'
import {members} from '../mock/members'
import {organizations} from '../mock/organizations'

const expect = chai.expect

export default describe('member api test', () => {
  let Member: MemberAPI
  let httpBackend: Backend
  beforeEach(() => {
    Member = new MemberAPI()
    httpBackend = new Backend()
    httpBackend
    .whenGET(`${apihost}/projects/projectId/members`)
    .respond(members)
  })

  it('get organization members should ok', (done: Function) => {
    const id = organizations[0]._id

    httpBackend
    .whenGET(`${apihost}/V2/organizations/${id}/members`)
    .respond(members)

    Member.getOrgMembers(id)
    .then(members => {
      expect(members).to.instanceof(Array)
      done()
    })

    httpBackend.flush()
  })

  it ('getMembers from project should ok', done => {
    Member.getProjectMembers('projectId')
    .then(data => {
      expect(data).to.be.instanceof(Array)
      expect(data.length).to.equal(members.length)
      done()
    })
    .catch((reason) => {
      console.error(reason.stack)
    })

    httpBackend.flush()
  })

  it('delete member from project should ok', done => {
    let Members: Member[]
    let length: number
    let memberId = members[0]._id

    httpBackend
    .whenDELETE(`${apihost}/members/${memberId}`)
    .respond({})

    Member.getProjectMembers('projectId')
    .then(data => {
      Members = data
      length = data.length
      return Member.deleteMember(data[0]._id)
    })
    .then(() => {
      return Member.getProjectMembers('projectId')
    })
    .then(data => {
      expect(data.length + 1).to.equal(length)
      let inData = false
      data.forEach((val) => {
        if (val._id === memberId) {
          inData = true
        }
      })
      expect(inData).to.be.false
      done()
    })
    .catch(reason => {
      console.error(reason.stack)
    })

    httpBackend.flush()
  })
})
