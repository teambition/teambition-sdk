'use strict'
import * as chai from 'chai'
import {Backend, ProjectAPI} from '../'
import {Member} from '../../src/schemas/member'
import {apihost} from '../app'
import {members} from '../mock'

const expect = chai.expect

export default describe('Member API test', () => {
  let httpBackend: Backend
  beforeEach(() => {
    httpBackend = new Backend()
    httpBackend
    .whenGET(`${apihost}/projects/projectId/members`)
    .respond(members)
  })

  it ('getMembers from project should ok', (done: Function) => {
    ProjectAPI.getMembers('projectId').then((data) => {
      expect(data).to.be.instanceof(Array)
      expect(data.length).to.equal(members.length)
      done()
    })
    .catch((reason) => {
      console.error(reason.stack)
    })

    httpBackend.flush()
  })

  it('delete member from project should ok', (done: Function) => {
    let members: Member[]
    let length: number

    httpBackend
    .whenDELETE(`${apihost}/members/55c0496b266e692f55d50239`)
    .respond({})

    ProjectAPI.getMembers('projectId').then((data) => {
      members = data
      length = data.length
      return ProjectAPI.deleteMember(data[0]._id)
    })
    .then(() => {
      return ProjectAPI.getMembers('projectId')
    })
    .then((data) => {
      expect(data.length + 1).to.equal(length)
      let inData = false
      data.forEach((val) => {
        if (val._id === '55c0496b266e692f55d50239') {
          inData = true
        }
      })
      expect(inData).to.be.false
      done()
    })
    .catch((reason) => {
      console.error(reason.stack)
    })

    httpBackend.flush()
  })
})
