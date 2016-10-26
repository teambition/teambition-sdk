'use strict'
import { apihost, Backend, SocketMock, SocketClient, SubscribeAPI, clone } from '../index'
import { flush, expectDeepEqual } from '../utils'
import { orgsSubscribe } from '../../mock/orgsSubscribe'

export default describe('Organization Subscribe Socket:', () => {
  let httpBackend: Backend
  let Socket: SocketMock
  let SubscribeApi: SubscribeAPI

  beforeEach(() => {
    flush()

    httpBackend = new Backend()
    Socket = new SocketMock(SocketClient)
    SubscribeApi = new SubscribeAPI()

    httpBackend.whenGET(`${apihost}subscribers/report?_organizationId=mock`)
      .respond(JSON.stringify(orgsSubscribe))
  })

  it('udpate subscribe should ok', function* () {
    const mockUpdate = clone(orgsSubscribe)
    mockUpdate.body.projects = mockUpdate.body.projects.concat([
      {
        _id: 'mockprojectid',
        name: 'mockprojectId',
        logo: 'logo',
        py: 'mockproject',
        pinyin: 'mockproject'
      }
    ])

    const signal = SubscribeApi.getOrgsSubscribe(<any>'mock')
      .publish()
      .refCount()

    yield Socket.emit('change', 'subscriber', orgsSubscribe._id, mockUpdate, signal.take(1))

    yield signal.take(1)
      .do(r => {
        expectDeepEqual(r, mockUpdate)
      })
  })
})
