'use strict'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import { Backend, OrganizationsAPI, apihost } from '../index'
import { organizations } from '../mock/organizations'
import { flush } from '../utils'

const expect = chai.expect
chai.use(sinonChai)

export default describe('Organizations API test', () => {
  let httpBackend: Backend
  const OrganizationAPI = new OrganizationsAPI()
  beforeEach(() => {
    flush()
    httpBackend = new Backend()
    httpBackend
      .whenGET(`${apihost}organizations`)
      .respond(JSON.stringify(organizations))
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

    httpBackend
      .whenGET(`${apihost}organizations/${id}`)
      .respond(JSON.stringify(organizations[0]))

    OrganizationAPI.getOrgs()
      .concatMap(x => {
        return OrganizationAPI.getOne(id)
      })
      .subscribe(data => {
        expect(data).to.deep.equal(organizations[0])
        done()
      })

    httpBackend.flush()
  })
})
