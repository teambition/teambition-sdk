'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import {Backend, OrganizationsAPI, clone, forEach} from '../'
import {apihost} from '../app'
import Member from '../../../src/schemas/member_schema'
import {organizations, members} from '../mock'
import {IOrganizationData} from 'teambition'

const expect = chai.expect
chai.use(sinonChai)

export default describe('Organizations API test', () => {
  let httpBackend: Backend
  const OrganizationAPI = new OrganizationsAPI()
  beforeEach(() => {
    httpBackend = new Backend()
    httpBackend
    .whenGET(`${apihost}/organizations`)
    .respond(organizations)
  })

  it('get organizations should ok', (done: Function) => {
    OrganizationAPI.getOrgs()
    .then((data: IOrganizationData[]) => {
      expect(data).to.instanceof(Array)
      done()
    })
    httpBackend.flush()
  })

  it('get one organization should ok', (done: Function) => {
    const id = organizations[0]._id
    let orgs: IOrganizationData[]
    const spy = sinon.spy()
    const originFetch = fetch

    httpBackend
    .whenGET(`${apihost}/organizations/${id}`)
    .respond(clone(organizations[0]))

    OrganizationAPI.getOrgs()
    .then((data: IOrganizationData[]) => {
      orgs = data
      fetch = spy
      return OrganizationAPI.getOne(id)
    })
    .then((data: IOrganizationData) => {
      const org = orgs[0]
      expect(spy.notCalled).to.be.true
      forEach(org, ((val, key) => {
        expect(val).to.equal(data[key])
      }))
      fetch = originFetch
      done()
    })
    .catch((reason) => {
      fetch = originFetch
      console.error(reason)
    })

    httpBackend.flush()
  })

  it('get organization members should ok', (done: Function) => {
    const id = organizations[0]._id

    httpBackend
    .whenGET(`${apihost}/V2/organizations/${id}/members`)
    .respond(members)

    OrganizationAPI.getMembers(id)
    .then((members: Member[]) => {
      expect(members).to.instanceof(Array)
      done()
    })

    httpBackend.flush()
  })
})
