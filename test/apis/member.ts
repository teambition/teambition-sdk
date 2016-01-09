'use strict'
import * as chai from 'chai'
import {Backend, MemberAPI} from '../'
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
    MemberAPI.getProjectMembers('projectId').then((data) => {
      expect(data).to.be.instanceof(Array)
      expect(data.length).to.equal(members.length)
      done()
    })

    httpBackend.flush()
  })
})
