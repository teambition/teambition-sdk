'use strict'
import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import { Backend, OrganizationAPI, apihost } from '../index'
import { organizations } from '../../mock/organizations'
import { flush, expectDeepEqual } from '../utils'

const expect = chai.expect
chai.use(sinonChai)

export default describe('Organizations API test', () => {
  let httpBackend: Backend
  const OrganizationApi = new OrganizationAPI()
  beforeEach(() => {
    flush()
    httpBackend = new Backend()
    httpBackend
      .whenGET(`${apihost}organizations`)
      .respond(JSON.stringify(organizations))
  })

  after(() => {
    httpBackend.restore()
  })

  it('get organizations should ok', done => {
    OrganizationApi.getOrgs()
      .subscribe(data => {
        expect(data).to.instanceof(Array)
        done()
      })
  })

  it('get one organization should ok', done => {
    const id = organizations[0]._id

    httpBackend
      .whenGET(`${apihost}organizations/${id}`)
      .respond(JSON.stringify(organizations[0]))

    OrganizationApi.getOrgs()
      .concatMap(x => {
        return OrganizationApi.getOne(<any>id)
      })
      .subscribe(data => {
        expectDeepEqual(data, organizations[0])
        done()
      })
  })
})
