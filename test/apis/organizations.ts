'use strict'
import * as chai from 'chai'
import {Backend, OrganizationAPI, forEach, clone} from '../'
import {apihost} from '../app'
import {organizations} from '../mock'
import {IOrganizationData} from 'teambition'

const expect = chai.expect

export default describe('organizations API test', () => {
  let httpBackend: Backend
  beforeEach(() => {
    httpBackend = new Backend()
    httpBackend.whenGET(`${apihost}/organizations`).respond(organizations)
  })
  it('get organizations should ok', (done: Function) => {
    OrganizationAPI.getOrganizations().then((organizations: IOrganizationData[]) => {
      expect(organizations).to.instanceof(Array)
      done()
    })
    httpBackend.flush()
  })
})
