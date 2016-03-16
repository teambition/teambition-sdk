'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import {Backend, OrganizationsAPI, clone, forEach} from '../index'
import {apihost} from '../app'
import {organizations} from '../mock'
import {OrganizationData} from '../type'

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

  it('get organizations should ok', done => {
    OrganizationAPI.getOrgs()
    .then(data => {
      expect(data).to.instanceof(Array)
      done()
    })
    httpBackend.flush()
  })

  it('get one organization should ok', done => {
    const id = organizations[0]._id
    let orgs: OrganizationData[]
    const spy = sinon.spy()
    const originFetch = fetch

    httpBackend
    .whenGET(`${apihost}/organizations/${id}`)
    .respond(clone(organizations[0]))

    OrganizationAPI.getOrgs()
    .then(data => {
      orgs = data
      fetch = spy
      return OrganizationAPI.getOne(id)
    })
    .then(data => {
      const org = orgs[0]
      expect(spy.notCalled).to.be.true
      forEach(org, ((val, key) => {
        if (key !== '$id') expect(val).to.equal(data[key])
      }))
      fetch = originFetch
      done()
    })
    .catch(reason => {
      fetch = originFetch
      console.error(reason)
    })

    httpBackend.flush()
  })
})
