'use strict'
import * as chai from 'chai'
import { apihost, RoleAPI, Backend, forEach } from '../index'
import { flush, expectDeepEqual } from '../utils'
import { roles, defaultRoles, mockAdd } from '../../mock/roles'

const expect = chai.expect

export default describe('role api spec: ', () => {
  let RoleApi: RoleAPI
  let httpBackend: Backend

  beforeEach(() => {
    flush()

    RoleApi = new RoleAPI()
    httpBackend = new Backend()
  })

  it('get default roles should ok', done => {
    httpBackend.whenGET(`${apihost}roles`)
      .respond(JSON.stringify(defaultRoles))

    RoleApi.getDefaultRoles()
      .subscribe(r => {
        forEach(r, (val, index) => {
          expectDeepEqual(defaultRoles[index], val)
        })
        done()
      })
  })

  it('get custom roles should ok', done => {
    const organizationId = roles[0]._organizationId

    httpBackend.whenGET(`${apihost}organizations/${organizationId}/roles`)
      .respond(JSON.stringify(roles))

    RoleApi.getCustomRoles(organizationId)
      .subscribe(r => {
        forEach(r, (val, index) => {
          expectDeepEqual(roles[index], val)
        })
        done()
      })
  })

  it('add role should ok', function* () {
    const organizationId = roles[0]._organizationId

    httpBackend.whenGET(`${apihost}organizations/${organizationId}/roles`)
      .respond(JSON.stringify(roles))

    httpBackend.whenGET(`${apihost}roles/${mockAdd._id}`)
      .respond(JSON.stringify(mockAdd))

    const signal = RoleApi.getCustomRoles(organizationId)
      .publish()
      .refCount()

    yield signal.take(1)

    yield RoleApi.getOne(<any>mockAdd._id)
      .take(1)

    yield signal.take(1)
      .do(r => {
        expect(r.length).to.equal(roles.length + 1)
        expectDeepEqual(mockAdd, r[0])
      })
  })
})
