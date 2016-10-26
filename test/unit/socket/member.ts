'use strict'
import * as chai from 'chai'
import {
  SocketMock,
  SocketClient,
  Backend,
  MemberAPI,
  MemberSchema,
  uuid,
  apihost
} from '../index'
import { members } from '../../mock/members'
import { flush, expectDeepEqual } from '../utils'

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

  it('should add new project member', function* () {

    const projectId: any = uuid()
    const memberId: any = uuid()
    const member = <any>{
      _id: uuid(),
      _memberId: memberId,
      _boundToObjectId: projectId,
      boundToObjectType: 'project'
    }

    httpBackend.whenGET(`${apihost}projects/${projectId}/members?page=1&count=30`)
      .respond(JSON.stringify([]))

    httpBackend.whenGET(`${apihost}members/${memberId}`)
      .respond(JSON.stringify(member))

    const signal = MemberApi.getProjectMembers(projectId)
      .publish()
      .refCount()

    yield signal.take(1)
      .do(members => {
        expect(members.length).to.be.equal(0)
      })

    yield Socket.emit('refresh', 'member', projectId, memberId)

    yield signal.take(1)
      .do(members => {
        expect(members.length).to.be.equal(1)
        expectDeepEqual(members[0], member)
      })
  })

  it('should remove project member', function* () {

    const count = 5
    const projectId: any = uuid()
    const members = <MemberSchema[]>[]
    for (let i = 0; i < count; i ++) {
      members.push(<any>{
        _id: uuid(),
        _memberId: uuid(),
        _boundToObjectId: projectId,
        boundToObjectType: 'project'
      })
    }
    const member = members[0]
    const memberId = member._memberId

    httpBackend.whenGET(`${apihost}projects/${projectId}/members?page=1&count=30`)
      .respond(JSON.stringify(members))

    const signal = MemberApi.getProjectMembers(projectId)
      .publish()
      .refCount()

    yield signal.take(1)
      .do(members => {
        expect(members.length).to.be.equal(count)
        expectDeepEqual(members[0], member)
      })

    yield Socket.emit('remove', 'member', projectId, memberId)

    yield signal.take(1)
      .do(members => {
        expect(members.length).to.be.equal(count - 1)
        expect(members.map(one => one._memberId))
          .to.not.contain(memberId)
      })
  })

  it('should add new organization member', function* () {

    const organizationId: any = uuid()
    const memberId = uuid()
    const member = <any>{
      _id: uuid(),
      _memberId: memberId,
      _boundToObjectId: organizationId,
      boundToObjectType: 'organization'
    }

    httpBackend.whenGET(`${apihost}V2/organizations/${organizationId}/members?page=1&count=30`)
      .respond(JSON.stringify([]))

    httpBackend.whenGET(`${apihost}members/${memberId}`)
      .respond(JSON.stringify(member))

    const signal = MemberApi.getOrgMembers(organizationId)
      .publish()
      .refCount()

    yield signal.take(1)
      .do(members => {
        expect(members.length).to.be.equal(0)
      })

    yield Socket.emit('refresh', 'member', organizationId, memberId)

    yield signal.take(1)
      .do(members => {
        expect(members.length).to.be.equal(1)
        expectDeepEqual(members[0], member)
      })
  })

  it('should remove organization member', function* () {

    const count = 5
    const organizationId: any = uuid()
    const members = <MemberSchema[]>[]
    for (let i = 0; i < count; i ++) {
      members.push(<any>{
        _id: uuid(),
        _memberId: uuid(),
        _boundToObjectId: organizationId,
        boundToObjectType: 'organization'
      })
    }
    const member = members[0]
    const memberId = member._memberId

    httpBackend.whenGET(`${apihost}V2/organizations/${organizationId}/members?page=1&count=30`)
      .respond(JSON.stringify(members))

    const signal = MemberApi.getOrgMembers(organizationId)
      .publish()
      .refCount()

    yield signal.take(1)
      .do(members => {
        expect(members.length).to.be.equal(count)
        expectDeepEqual(members[0], member)
      })

    yield Socket.emit('remove', 'member', organizationId, memberId)

    yield signal.take(1)
      .do(members => {
        expect(members.length).to.be.equal(count - 1)
        expect(members.map(one => one._memberId))
          .to.not.contain(memberId)
      })
  })
})
