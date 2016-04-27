'use strict'
import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
import {Backend, OrganizationsAPI, clone, forEach, apihost} from '../index'
import {organizations} from '../mock/organizations'
import {flushDatabase} from '../utils'

const expect = chai.expect
chai.use(sinonChai)

export default describe('Organizations API test', () => {
  let httpBackend: Backend
  const OrganizationAPI = new OrganizationsAPI()
  beforeEach(() => {
    flushDatabase()
    httpBackend = new Backend()
    httpBackend
    .whenGET(`${apihost}/organizations`)
    .respond(organizations)
  })

  it('get organizations should ok', done => {
    OrganizationAPI.getOrgs()
    .subscribe(data => {
      expect(data).to.instanceof(Array)
      done()
    })
    httpBackend.flush()
  })

  it('get one organization should ok', done => {
    const id = organizations[0]._id
    const spy = sinon.spy()

    httpBackend
    .whenGET(`${apihost}/organizations/${id}`)
    .respond(clone(organizations[0]))

    OrganizationAPI.getOrgs()
      .concatMap(x => {
        return OrganizationAPI.getOne(id)
      })
      .subscribe(data => {
        expect(spy.notCalled).to.be.true
        expect(data).to.deep.equal(organizations[0])
        done()
      })

    httpBackend.flush()
  })
})
