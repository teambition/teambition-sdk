'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import {Backend, OrganizationAPI, clone, forEach} from '../'
import {apihost} from '../app'
import {organizations} from '../mock'
import {IOrganizationData} from 'teambition'

const expect = chai.expect
chai.use(sinonChai)

export default describe('organizations API test', () => {
  let httpBackend: Backend
  beforeEach(() => {
    httpBackend = new Backend()
    httpBackend
    .whenGET(`${apihost}/organizations`)
    .respond(organizations)
  })
  it('get organizations should ok', (done: Function) => {
    OrganizationAPI.getAll()
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

    OrganizationAPI.getAll()
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
})
