'use strict'
import * as chai from 'chai'
import {
  SocketMock,
  SocketClient,
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
    Socket = new SocketMock(SocketClient)
    MemberApi = new MemberAPI
  })

  it('change role should ok', function* () {
    httpBackend.whenGET(`${apihost}projects/${projectId}/members?page=1&count=30`)
      .respond(JSON.stringify(members))

    const signal = MemberApi.getProjectMembers(projectId)
      .publish()
      .refCount()

    yield Socket.emit('change', 'member', members[0]._memberId, {
      _roleId: 'mockroleid'
    }, signal.take(1))

    yield signal.take(1)
      .do(r => {
        expect(r[0]._roleId).to.equal('mockroleid')
      })
  })
})
