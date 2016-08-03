'use strict'
import * as chai from 'chai'
import {
  SocketMock,
  Backend,
  MemberAPI,
  apihost
} from '../index'
import { members } from '../../mock/members'
import { flush } from '../utils'

const expect = chai.expect

export default describe('socket member test', () => {
  const projectId = members[0]._boundToObjectId
  let httpBackend: Backend
  let Socket: SocketMock
  let MemberApi: MemberAPI

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Socket = new SocketMock()
    MemberApi = new MemberAPI
  })

  it('change role should ok', done => {
    httpBackend.whenGET(`${apihost}projects/${projectId}/members`)
      .respond(JSON.stringify(members))

    MemberApi.getProjectMembers(projectId)
      .skip(1)
      .subscribe(r => {
        expect(r[0]._roleId).to.equal('mockroleid')
        done()
      })

    httpBackend.flush()

    Socket.emit('change', 'member', members[0]._memberId, {
      _roleId: 'mockroleid'
    })
  })
})
